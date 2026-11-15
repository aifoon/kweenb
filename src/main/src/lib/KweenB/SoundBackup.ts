/**
 * Saving the sounds (audio scenes) of a bee on this computer and putting
 * them back on a speaker.
 *
 * The layout of the backup folder:
 *
 *   <backup folder>/<beeNN>/info.txt
 *   <backup folder>/<beeNN>/files/<legalName>/audio.wav
 *   <backup folder>/<beeNN>/files/<legalName>/data.json
 *
 * Nothing in here needs Electron, so it can be run on its own.
 */

import fs from "fs";
import path from "path";
import { ISoundBackup } from "@shared/interfaces";
import SpeakerApi, { SpeakerScene } from "./SpeakerApi";

/**
 * Something that is going on and can be stopped
 */
export interface SoundTransferOperation {
  cancelled: boolean;
  // stops the download or upload that is on its way
  abort?: () => void;
}

export interface SoundTransferOptions {
  // called before every sound, counted from 1
  onProgress?: (current: number, total: number, sound: string) => void;
  // set cancelled to stop after (or during) the current sound
  operation?: SoundTransferOperation;
  // putting back only: also take the sounds off the speaker that are not
  // in the saved sounds, so the speaker ends up exactly like them
  exact?: boolean;
}

export interface SoundBackupResult {
  // the folder of this bee in the backup folder
  folder: string;
  // the number of sounds that are saved now
  sounds: number;
  downloaded: number;
  removed: number;
  // the bee has no sounds, so nothing was touched
  nothingToSave: boolean;
  cancelled: boolean;
}

export interface SoundRestoreResult {
  // the number of sounds in the backup
  sounds: number;
  uploaded: number;
  // the sounds that were taken off the speaker (an exact copy only)
  removed: number;
  cancelled: boolean;
}

// a scene is a folder with these two files
const AUDIO_FILE = "audio.wav";
const DATA_FILE = "data.json";

// a download is written under this name and takes its place when complete
const AUDIO_FILE_IN_PROGRESS = "audio.wav.part";

// the folder name of a scene only has these characters
const LEGAL_NAME = /^[a-z0-9_]+$/;

/**
 * The name under which the sounds of a bee are saved (bee07 for bee 7).
 * This is also the name the bee has in Jack.
 * @param id The number of the bee
 */
export const backupNameOfBee = (id: number): string =>
  `bee${String(id).padStart(2, "0")}`;

/**
 * Does a file or folder exist
 */
const exists = async (fileOrFolder: string): Promise<boolean> => {
  try {
    await fs.promises.access(fileOrFolder);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * The scenes that are saved in a folder (the legal names), sorted
 * @param filesFolder <backup folder>/<beeNN>/files
 * @param onlyWithAudio Leave out the folders without audio
 */
const savedScenes = async (
  filesFolder: string,
  onlyWithAudio: boolean
): Promise<string[]> => {
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(filesFolder, { withFileTypes: true });
  } catch (e) {
    return [];
  }
  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (!onlyWithAudio) return folders;

  const withAudio: string[] = [];
  for (const folder of folders) {
    if (await exists(path.join(filesFolder, folder, AUDIO_FILE)))
      withAudio.push(folder);
  }
  return withAudio;
};

/**
 * Format a date as it is written in info.txt (2026-11-13 22:29)
 */
const formatInfoDate = (date: Date): string => {
  const twoDigits = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(
    date.getDate()
  )} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
};

/**
 * Format a number of bytes as it is written in info.txt (827M, 1.0G)
 */
const formatInfoSize = (bytes: number): string => {
  const megaBytes = bytes / (1024 * 1024);
  return megaBytes >= 1024
    ? `${(megaBytes / 1024).toFixed(1)}G`
    : `${Math.round(megaBytes)}M`;
};

/**
 * Read one value of info.txt ("date: 2026-11-13 22:29")
 */
const readInfoValue = (info: string, key: string): string | null => {
  const line = info
    .split("\n")
    .find((currentLine) => currentLine.trim().startsWith(`${key}:`));
  return line
    ? line
        .trim()
        .slice(key.length + 1)
        .trim()
    : null;
};

/**
 * Look what is saved for one bee
 * @param backupFolder
 * @param name The name of the bee (the folder in the backup folder)
 * @returns null when nothing is saved under this name
 */
const describeBackup = async (
  backupFolder: string,
  name: string
): Promise<ISoundBackup | null> => {
  const folder = path.join(backupFolder, name);
  const filesFolder = path.join(folder, "files");
  if (!(await exists(filesFolder))) return null;

  // count what is really there, info.txt is only a note
  const scenes = await savedScenes(filesFolder, true);
  let sizeBytes = 0;
  for (const scene of scenes) {
    const { size } = await fs.promises.stat(
      path.join(filesFolder, scene, AUDIO_FILE)
    );
    sizeBytes += size;
  }

  // the date that was written down, otherwise the date of the last change
  let date: Date | null = null;
  const infoFile = path.join(folder, "info.txt");
  try {
    const written = readInfoValue(
      await fs.promises.readFile(infoFile, "utf8"),
      "date"
    );
    const parsed = written ? new Date(written.replace(" ", "T")) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) date = parsed;
    else date = (await fs.promises.stat(infoFile)).mtime;
  } catch (e) {
    date = (await fs.promises.stat(filesFolder)).mtime;
  }

  return { name, date: date.toISOString(), sounds: scenes.length, sizeBytes };
};

/**
 * List what is saved in the backup folder
 * @param backupFolder
 */
const listBackups = async (backupFolder: string): Promise<ISoundBackup[]> => {
  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(backupFolder, { withFileTypes: true });
  } catch (e) {
    // nothing was saved yet
    return [];
  }

  const backups: ISoundBackup[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const backup = await describeBackup(backupFolder, entry.name);
    if (backup) backups.push(backup);
  }
  return backups.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Is the audio in a file the same as the audio of a scene on the speaker
 * @param ipAddress
 * @param scene The scene as the speaker listed it
 * @param audioFile The local file
 */
const isSameAudio = async (
  ipAddress: string,
  scene: SpeakerScene,
  audioFile: string
): Promise<boolean> => {
  let size: number;
  try {
    size = (await fs.promises.stat(audioFile)).size;
  } catch (e) {
    return false;
  }
  if (size !== scene.sizeBytes) return false;

  // the speaker does not know the checksum of older scenes until it is asked
  const sha256 =
    scene.sha256 ||
    (await SpeakerApi.getSceneChecksum(ipAddress, scene.legalName));
  return (await SpeakerApi.checksumOfFile(audioFile)) === sha256;
};

/**
 * Save the sounds of a bee: afterwards the folder of the bee holds exactly
 * the sounds that are on the bee. Only what is missing or different is
 * downloaded.
 * @param ipAddress The address of the bee
 * @param backupFolder
 * @param name The name to save the bee under (see backupNameOfBee)
 * @param options Progress and a way to stop
 */
const backupBee = async (
  ipAddress: string,
  backupFolder: string,
  name: string,
  options: SoundTransferOptions = {}
): Promise<SoundBackupResult> => {
  const operation = options.operation || { cancelled: false };
  const folder = path.join(backupFolder, name);
  const filesFolder = path.join(folder, "files");

  const scenes = (await SpeakerApi.getScenes(ipAddress)).filter((scene) =>
    LEGAL_NAME.test(scene.legalName)
  );
  const savedBefore = await savedScenes(filesFolder, false);

  const result: SoundBackupResult = {
    folder,
    sounds: savedBefore.length,
    downloaded: 0,
    removed: 0,
    nothingToSave: scenes.length === 0,
    cancelled: false,
  };

  // a bee without sounds (freshly flashed, or its sounds are not put back
  // yet) must not empty what was saved before
  if (result.nothingToSave) return result;

  await fs.promises.mkdir(filesFolder, { recursive: true });

  for (let i = 0; i < scenes.length; i += 1) {
    if (operation.cancelled) break;
    const scene = scenes[i];
    if (options.onProgress)
      options.onProgress(i + 1, scenes.length, scene.name);

    const sceneFolder = path.join(filesFolder, scene.legalName);
    const audioFile = path.join(sceneFolder, AUDIO_FILE);

    if (!(await isSameAudio(ipAddress, scene, audioFile))) {
      await fs.promises.mkdir(sceneFolder, { recursive: true });
      const fileInProgress = path.join(sceneFolder, AUDIO_FILE_IN_PROGRESS);
      try {
        const expected =
          scene.sha256 ||
          (await SpeakerApi.getSceneChecksum(ipAddress, scene.legalName));
        const received = await SpeakerApi.downloadScene(
          ipAddress,
          scene.legalName,
          fileInProgress,
          {
            onAbortable: (abort) => {
              operation.abort = abort;
            },
          }
        );
        if (received !== expected)
          throw new Error(`"${scene.name}" did not arrive complete`);

        // complete: now it may take the place of what was there
        await fs.promises.rename(fileInProgress, audioFile);
        result.downloaded += 1;
      } catch (e) {
        await fs.promises.rm(fileInProgress, { force: true });
        if (operation.cancelled) break;
        throw e;
      } finally {
        operation.abort = undefined;
      }
    }

    // the name and the address of the scene
    const data = JSON.stringify({
      name: scene.name,
      oscAddress: `${scene.legalName}/${AUDIO_FILE}`,
    });
    const dataFile = path.join(sceneFolder, DATA_FILE);
    let currentData = "";
    try {
      currentData = await fs.promises.readFile(dataFile, "utf8");
    } catch (e) {
      // not there yet
    }
    if (currentData !== data) await fs.promises.writeFile(dataFile, data);
  }

  result.cancelled = operation.cancelled;

  // remove what is no longer on the bee
  if (!result.cancelled) {
    const onBee = new Set(scenes.map((scene) => scene.legalName));
    for (const saved of savedBefore) {
      if (onBee.has(saved)) continue;
      await fs.promises.rm(path.join(filesFolder, saved), {
        recursive: true,
        force: true,
      });
      result.removed += 1;
    }
  }

  // write down what is saved
  const backup = await describeBackup(backupFolder, name);
  result.sounds = backup ? backup.sounds : 0;
  await fs.promises.writeFile(
    path.join(folder, "info.txt"),
    [
      `name: ${name}`,
      `ip: ${ipAddress}`,
      `date: ${formatInfoDate(new Date())}`,
      `scenes: ${result.sounds}`,
      `size: ${formatInfoSize(backup ? backup.sizeBytes : 0)}`,
      "",
    ].join("\n")
  );

  return result;
};

/**
 * Put saved sounds on a speaker. A sound the speaker already has (the same
 * audio) is skipped; sounds that are only on the speaker stay there.
 * @param ipAddress The address of the speaker
 * @param backupFolder
 * @param name The name of the backup (the bee the sounds came from)
 * @param options Progress and a way to stop
 */
const restoreToSpeaker = async (
  ipAddress: string,
  backupFolder: string,
  name: string,
  options: SoundTransferOptions = {}
): Promise<SoundRestoreResult> => {
  const operation = options.operation || { cancelled: false };
  const filesFolder = path.join(backupFolder, name, "files");

  const saved = (await savedScenes(filesFolder, true)).filter((legalName) =>
    LEGAL_NAME.test(legalName)
  );
  const onSpeaker = new Map(
    (await SpeakerApi.getScenes(ipAddress)).map((scene) => [
      scene.legalName,
      scene,
    ])
  );

  const result: SoundRestoreResult = {
    sounds: saved.length,
    uploaded: 0,
    removed: 0,
    cancelled: false,
  };

  for (let i = 0; i < saved.length; i += 1) {
    if (operation.cancelled) break;
    const legalName = saved[i];
    const sceneFolder = path.join(filesFolder, legalName);
    const audioFile = path.join(sceneFolder, AUDIO_FILE);

    // the name as the user wrote it
    let sceneName = legalName;
    try {
      const data = JSON.parse(
        await fs.promises.readFile(path.join(sceneFolder, DATA_FILE), "utf8")
      );
      if (typeof data.name === "string" && data.name) sceneName = data.name;
    } catch (e) {
      // no (readable) data: the folder name will do
    }

    if (options.onProgress) options.onProgress(i + 1, saved.length, sceneName);

    const sceneOnSpeaker = onSpeaker.get(legalName);
    if (
      sceneOnSpeaker &&
      (await isSameAudio(ipAddress, sceneOnSpeaker, audioFile))
    )
      continue;

    try {
      await SpeakerApi.uploadScene(ipAddress, legalName, sceneName, audioFile, {
        onAbortable: (abort) => {
          operation.abort = abort;
        },
      });
      result.uploaded += 1;
    } catch (e) {
      if (operation.cancelled) break;
      throw e;
    } finally {
      operation.abort = undefined;
    }
  }

  // an exact copy: what is on the speaker but not in the saved sounds goes.
  // Only after everything arrived, and never with nothing to put back: that
  // would empty the speaker.
  if (options.exact && !operation.cancelled && saved.length > 0) {
    for (const legalName of onSpeaker.keys()) {
      if (operation.cancelled) break;
      if (saved.includes(legalName)) continue;
      // eslint-disable-next-line no-await-in-loop
      await SpeakerApi.deleteScene(ipAddress, legalName);
      result.removed += 1;
    }
  }

  result.cancelled = operation.cancelled;
  return result;
};

export default {
  backupBee,
  backupNameOfBee,
  describeBackup,
  listBackups,
  restoreToSpeaker,
};
