/**
 * A copy of the saved sounds in the cloud (Cloudflare R2).
 *
 * For every bee the cloud holds its sounds and a list (state.json) of the
 * files that make up what the bee had when it was last saved. That list is
 * written last, so it always describes a complete set. Files are never
 * removed from the cloud: a sound that was taken off a bee stays in the
 * bucket, it is only no longer on the list.
 *
 * Nothing in here needs Electron, so it can be tested on its own.
 */

import fs from "fs";
import path from "path";
import {
  CloudFile,
  CloudPlan,
  LocalFile,
  beeOfKey,
  planDownload,
  planUpload,
} from "./CloudPlan";
import {
  R2Error,
  R2Operation,
  R2Settings,
  getFile,
  getText,
  listObjects,
  putFile,
  putText,
} from "./R2Client";

// a file that is still being written is not part of what was saved
const IN_PROGRESS = /\.part$/;

// the list of the files of a bee, in the cloud only
const STATE_FILE = "state.json";
const stateKeyOf = (bee: string) => `${bee}/${STATE_FILE}`;
const isStateKey = (key: string) => key.endsWith(`/${STATE_FILE}`);

// what state.json holds
interface BeeState {
  // when the sounds were read from the bee
  savedAt: string;
  files: { key: string; sizeBytes: number }[];
}

/**
 * Every file of the saved sounds on this computer
 * @param backupFolder The folder with a folder per bee (bee07, ...)
 */
export const listLocalFiles = async (
  backupFolder: string
): Promise<LocalFile[]> => {
  const files: LocalFile[] = [];
  const walk = async (folder: string, key: string) => {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(folder, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const entry of entries) {
      const entryKey = key ? `${key}/${entry.name}` : entry.name;
      const entryPath = path.join(folder, entry.name);
      if (entry.name.startsWith(".") || IN_PROGRESS.test(entry.name)) continue;
      if (entry.isDirectory()) {
        // only the folders of bees are saved sounds
        if (key === "" && beeOfKey(`${entry.name}/`) === null) continue;
        // eslint-disable-next-line no-await-in-loop
        await walk(entryPath, entryKey);
      } else if (entry.isFile() && key !== "" && !isStateKey(entryKey)) {
        // eslint-disable-next-line no-await-in-loop
        const stats = await fs.promises.stat(entryPath);
        files.push({
          key: entryKey,
          sizeBytes: stats.size,
          modified: stats.mtime,
        });
      }
    }
  };
  await walk(backupFolder, "");
  return files;
};

export interface CloudBee {
  // bee07
  name: string;
  // the sounds saved on this computer, and when they were read from the bee
  here: number;
  hereSavedAt: Date | null;
  // the sounds of the bee in the cloud, and when those were read from the bee
  inCloud: number;
  cloudSavedAt: Date | null;
  // is the cloud the same as what is saved on this computer
  cloudIsCurrent: boolean;
}

export interface CloudState {
  // what has to be sent to the cloud, and what can be fetched from it
  upload: CloudPlan;
  download: CloudPlan;
  // the bees whose list in the cloud has to be written (again)
  listsToWrite: string[];
  bees: CloudBee[];
  local: LocalFile[];
}

// a scene counts once: by its audio file
const isSound = (key: string) => /\/audio\.wav$/.test(key);

const parseState = (text: string | null): BeeState | null => {
  if (!text) return null;
  try {
    const state = JSON.parse(text);
    if (!Array.isArray(state?.files)) return null;
    return {
      savedAt: String(state.savedAt || ""),
      files: state.files
        .filter((f: any) => f && typeof f.key === "string")
        .map((f: any) => ({ key: f.key, sizeBytes: Number(f.sizeBytes) || 0 })),
    };
  } catch (e) {
    return null;
  }
};

const sameFiles = (
  a: { key: string; sizeBytes: number }[],
  b: { key: string; sizeBytes: number }[]
): boolean => {
  const listed = (files: { key: string; sizeBytes: number }[]) =>
    files
      .map((f) => `${f.key}:${f.sizeBytes}`)
      .sort()
      .join("\n");
  return listed(a) === listed(b);
};

/**
 * When the sounds of a bee were read from it: the date of its info.txt,
 * which is written at the end of every save
 */
const savedAtOf = (files: LocalFile[], bee: string): Date | null =>
  files.find((f) => f.key === `${bee}/info.txt`)?.modified || null;

/**
 * Compare the saved sounds on this computer with the cloud
 */
export const getCloudState = async (
  settings: R2Settings,
  backupFolder: string,
  operation?: R2Operation
): Promise<CloudState> => {
  const [local, everything] = await Promise.all([
    listLocalFiles(backupFolder),
    listObjects(settings, "", operation),
  ]);
  const cloudFiles = everything.filter((file) => !isStateKey(file.key));
  const names = [
    ...new Set(
      [...local, ...cloudFiles]
        .map((file) => beeOfKey(file.key))
        .filter((name): name is string => name !== null)
    ),
  ].sort();

  // the list of every bee that has one in the cloud
  const states = new Map<string, BeeState | null>();
  await Promise.all(
    names.map(async (name) => {
      const hasList = everything.some((f) => f.key === stateKeyOf(name));
      states.set(
        name,
        hasList
          ? parseState(await getText(settings, stateKeyOf(name), operation))
          : null
      );
    })
  );

  // what the cloud holds of a bee is what its list names; a bee without a
  // list (sent by something else) is taken as it is
  const current: CloudFile[] = cloudFiles.filter((file) => {
    const state = states.get(beeOfKey(file.key) || "");
    return !state || state.files.some((f) => f.key === file.key);
  });

  const upload = planUpload(local, cloudFiles);
  const ofBee = (files: { key: string }[], name: string) =>
    files.filter((f) => beeOfKey(f.key) === name);

  const bees: CloudBee[] = names.map((name) => {
    const here = ofBee(local, name) as LocalFile[];
    const state = states.get(name) || null;
    const inCloud = ofBee(current, name);
    const nothingToSend = !upload.transfer.some(
      (f) => beeOfKey(f.key) === name
    );
    return {
      name,
      here: here.filter((f) => isSound(f.key)).length,
      hereSavedAt: savedAtOf(local, name),
      inCloud: inCloud.filter((f) => isSound(f.key)).length,
      cloudSavedAt:
        state && state.savedAt && !Number.isNaN(Date.parse(state.savedAt))
          ? new Date(state.savedAt)
          : null,
      cloudIsCurrent:
        here.length === 0 ||
        (nothingToSend && state !== null && sameFiles(state.files, here)),
    };
  });

  return {
    upload,
    download: planDownload(current, local),
    listsToWrite: bees
      .filter((bee) => bee.here > 0 && !bee.cloudIsCurrent)
      .map((bee) => bee.name),
    bees,
    local,
  };
};

export interface CloudProgress {
  // the file that is on its way, counted from 1
  current: number;
  total: number;
  key: string;
  doneBytes: number;
  totalBytes: number;
}

export interface CloudTransferResult {
  files: number;
  cancelled: boolean;
}

/**
 * Where a file of the saved sounds is on this computer. A key that would
 * leave the backup folder is refused.
 */
export const localPathOf = (backupFolder: string, key: string): string => {
  const parts = key.split("/");
  if (
    beeOfKey(key) === null ||
    parts.some((part) => part === "" || part === "." || part === "..") ||
    key.includes("\\") ||
    key.includes("\0")
  )
    throw new R2Error(`The cloud holds a file with a strange name (${key}).`);
  return path.join(backupFolder, ...parts);
};

const transfer = async (
  plan: CloudPlan,
  operation: R2Operation,
  onProgress: ((progress: CloudProgress) => void) | undefined,
  one: (key: string, onBytes: (bytes: number) => void) => Promise<void>
): Promise<CloudTransferResult> => {
  let doneBytes = 0;
  let files = 0;
  for (const [index, file] of plan.transfer.entries()) {
    if (operation.cancelled) break;
    const tell = (bytes: number) => {
      if (onProgress)
        onProgress({
          current: index + 1,
          total: plan.transfer.length,
          key: file.key,
          doneBytes: doneBytes + bytes,
          totalBytes: plan.transferBytes,
        });
    };
    tell(0);
    try {
      // eslint-disable-next-line no-await-in-loop
      await one(file.key, tell);
    } catch (e) {
      if (operation.cancelled) break;
      throw e;
    }
    doneBytes += file.sizeBytes;
    files += 1;
  }
  return { files, cancelled: operation.cancelled };
};

/**
 * Bring the cloud up to date with what is saved on this computer: send the
 * files the cloud does not have, then write the list of every bee that
 * changed. A bee whose files did not all arrive keeps its old list.
 */
export const sendToCloud = async (
  settings: R2Settings,
  backupFolder: string,
  state: CloudState,
  operation: R2Operation,
  onProgress?: (progress: CloudProgress) => void
): Promise<CloudTransferResult> => {
  const result = await transfer(
    state.upload,
    operation,
    onProgress,
    (key, onBytes) =>
      putFile(settings, key, localPathOf(backupFolder, key), operation, onBytes)
  );
  if (result.cancelled) return result;
  for (const name of state.listsToWrite) {
    const files = state.local.filter((f) => beeOfKey(f.key) === name);
    const list: BeeState = {
      savedAt: (savedAtOf(state.local, name) || new Date()).toISOString(),
      files: files.map(({ key, sizeBytes }) => ({ key, sizeBytes })),
    };
    // eslint-disable-next-line no-await-in-loop
    await putText(
      settings,
      stateKeyOf(name),
      `${JSON.stringify(list, null, 1)}\n`,
      operation
    );
  }
  return result;
};

/**
 * Fetch what this computer does not have yet
 */
export const getFromCloud = (
  settings: R2Settings,
  backupFolder: string,
  state: CloudState,
  operation: R2Operation,
  onProgress?: (progress: CloudProgress) => void
): Promise<CloudTransferResult> =>
  transfer(state.download, operation, onProgress, async (key, onBytes) => {
    const filePath = localPathOf(backupFolder, key);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await getFile(settings, key, filePath, operation, onBytes);
  });

// where the sounds of a bee are put that are fetched to go on a speaker:
// next to the saved sounds, but not part of them
export const CLOUD_STAGING_FOLDER = ".cloud";

/**
 * Fetch the sounds of one bee as the cloud has them, to put them on a
 * speaker. They go into a folder of their own, so what is saved on this
 * computer is not touched; a file that is already on this computer is
 * copied instead of fetched.
 * @returns The folder to put back from (it holds a folder with the name of
 * the bee)
 */
export const fetchBeeForRestore = async (
  settings: R2Settings,
  backupFolder: string,
  bee: string,
  operation: R2Operation,
  onProgress?: (progress: CloudProgress) => void
): Promise<string> => {
  if (beeOfKey(`${bee}/`) !== bee)
    throw new R2Error(`"${bee}" is not the name of a bee.`);
  const staging = path.join(backupFolder, CLOUD_STAGING_FOLDER);

  // what the bee is made of: its list, or everything when it has none
  const inCloud = (await listObjects(settings, `${bee}/`, operation)).filter(
    (file) => !isStateKey(file.key)
  );
  const list = parseState(await getText(settings, stateKeyOf(bee), operation));
  const wanted = list
    ? inCloud.filter((file) => list.files.some((f) => f.key === file.key))
    : inCloud;
  if (wanted.length === 0)
    throw new R2Error(`The cloud holds no sounds of ${bee}.`);

  // the folder ends up with exactly these files
  const keep = new Set(wanted.map((file) => file.key));
  const there = await listLocalFiles(staging);
  await Promise.all(
    there
      .filter((file) => beeOfKey(file.key) === bee && !keep.has(file.key))
      .map((file) =>
        fs.promises.rm(localPathOf(staging, file.key), { force: true })
      )
  );
  const have = new Map(there.map((file) => [file.key, file.sizeBytes]));
  const missing = wanted.filter(
    (file) => have.get(file.key) !== file.sizeBytes
  );

  const plan: CloudPlan = {
    transfer: missing
      .map(({ key, sizeBytes }) => ({ key, sizeBytes }))
      .sort((a, b) => a.sizeBytes - b.sizeBytes),
    transferBytes: missing.reduce((sum, file) => sum + file.sizeBytes, 0),
    same: wanted.length - missing.length,
    onlyThere: 0,
  };
  const result = await transfer(
    plan,
    operation,
    onProgress,
    async (key, onBytes) => {
      const target = localPathOf(staging, key);
      await fs.promises.mkdir(path.dirname(target), { recursive: true });
      // the same file is often on this computer already
      const saved = localPathOf(backupFolder, key);
      const size = plan.transfer.find((file) => file.key === key)?.sizeBytes;
      const savedSize = await fs.promises
        .stat(saved)
        .then((stats) => stats.size)
        .catch(() => -1);
      if (savedSize === size) {
        await fs.promises.copyFile(saved, target);
        onBytes(savedSize);
        return;
      }
      await getFile(settings, key, target, operation, onBytes);
    }
  );
  if (result.cancelled) throw new R2Error("Stopped.");
  return staging;
};
