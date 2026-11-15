/**
 * New speakers, and the sounds of the bees that are saved on this computer
 */

import {
  IAdoptSpeakerProgress,
  IAdoptSpeakerRequest,
  IAdoptFromNetworkResult,
  IAdoptSpeakerResult,
  IBee,
  IFoundSpeaker,
  IRestoreSoundsResult,
  ISaveSoundsResult,
  ISoundBackup,
  ISoundsProgress,
} from "@shared/interfaces";
import { BeeActiveState, ChannelType } from "@shared/enums";
import { KweenBGlobal } from "../kweenb";
import { BEE_ADDRESS_OFFSET, BEE_ADDRESS_PREFIX } from "../consts";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import { SpeakerApiError } from "../lib/KweenB/SpeakerApi";
import SpeakerDiscovery from "../lib/KweenB/SpeakerDiscovery";
import SoundBackup, {
  SoundTransferOperation,
  backupNameOfBee,
} from "../lib/KweenB/SoundBackup";
import {
  SpeakerAdoptionError,
  fixedAddressOfBee,
  giveNumber,
  isValidBeeNumber,
} from "../lib/KweenB/SpeakerAdoption";

// Import models
import Bee from "../models/Bee";

// looks for speakers as long as the renderer asks for them
const speakerDiscovery = new SpeakerDiscovery();

// sounds are saved or put back for one thing at a time
let currentOperation: SoundTransferOperation | null = null;

const BUSY_MESSAGE =
  "KweenB is still busy saving or putting back sounds. Wait until that is finished and try again.";

/**
 * The folder on this computer where the sounds are saved
 */
const getBackupFolder = async (): Promise<string> =>
  (await SettingHelpers.getAllSettings()).kweenBSettings.backupFolder;

/**
 * Tell what went wrong in words that need no knowledge of the software,
 * together with what to try
 */
const inPlainWords = (e: any): string => {
  if (e instanceof SpeakerAdoptionError) return e.message;
  if (e instanceof SpeakerApiError) {
    if (e.statusCode === 507)
      return "The speaker is full. Remove some sounds from it and try again.";
    if (e.statusCode === 422)
      return "A sound did not arrive complete. Try again.";
    if (e.message.startsWith("The file could not"))
      return "A sound could not be written on this computer. Check that there is enough free space and try again.";
    if (e.statusCode === 0)
      return "The connection with the speaker was lost. Check that it is still switched on and not too far away, then try again.";
    return `The speaker did not accept it (${e.message}). Try again.`;
  }
  if (e?.code === "ENOSPC")
    return "This computer has no space left. Free up some space and try again.";
  if (e?.code === "EACCES" || e?.code === "EPERM" || e?.code === "EROFS")
    return "KweenB is not allowed to write in the folder for saved sounds. Choose another folder or check its permissions.";
  return e?.message
    ? `${e.message}. Try again.`
    : "Something went wrong. Try again.";
};

/**
 * Let the renderer know which sound is saved or put back
 */
const sendSoundsProgress = (progress: ISoundsProgress) => {
  KweenBGlobal.kweenb.mainWindow.webContents.send("sounds-progress", progress);
};

/**
 * Let the renderer know how far a new speaker is
 */
const sendAdoptSpeakerProgress = (progress: IAdoptSpeakerProgress) => {
  KweenBGlobal.kweenb.mainWindow.webContents.send(
    "adopt-speaker-progress",
    progress
  );
};

/**
 * Make sure the bee with this number is known in the database, on its fixed
 * address and active, and that its status is followed
 * @param id The number of the bee
 * @param ipAddress The fixed address of the bee
 */
const saveAdoptedBee = async (id: number, ipAddress: string) => {
  const name = backupNameOfBee(id);

  if (await Bee.findOne({ where: { id } })) {
    // the new speaker takes the place of the bee that had this number
    await Bee.update({ name, ipAddress, isActive: true }, { where: { id } });

    // the worker follows the bee on its (new) address
    KweenBGlobal.kweenb.beeStates.updateBeeData({
      id,
      name,
      ipAddress,
      isActive: true,
    });
    return;
  }

  const createdBee = await BeeHelpers.createBee({
    id,
    name,
    ipAddress,
    isActive: true,
    channelType: ChannelType.MONO,
    channel1: id,
  });

  // because bees in the worker are initialized at startup, we need to append this manually
  KweenBGlobal.kweenb.beeStates.addBees([createdBee]);
};

/**
 * Put saved sounds on a speaker, as the current operation
 * @param ipAddress The address of the speaker
 * @param speakerName The name of the speaker, for the progress
 * @param backupName The saved sounds
 * @param onProgress
 */
export const restoreSoundsToSpeaker = async (
  ipAddress: string,
  speakerName: string,
  backupName: string,
  onProgress: (current: number, total: number, sound: string) => void,
  options: {
    // another folder than the backup folder (sounds fetched from the cloud)
    folder?: string;
    // also take the sounds off the speaker that are not in the saved sounds
    exact?: boolean;
  } = {}
): Promise<IRestoreSoundsResult> => {
  if (currentOperation)
    return {
      success: false,
      sounds: 0,
      cancelled: false,
      message: BUSY_MESSAGE,
    };

  currentOperation = { cancelled: false };
  try {
    const backupFolder = options.folder || (await getBackupFolder());
    const backup = await SoundBackup.describeBackup(backupFolder, backupName);
    if (!backup || backup.sounds === 0)
      return {
        success: false,
        sounds: 0,
        cancelled: false,
        message: `The saved sounds of ${backupName} are no longer in ${backupFolder}. Choose other sounds or start without sounds.`,
      };

    const { sounds, removed, cancelled } = await SoundBackup.restoreToSpeaker(
      ipAddress,
      backupFolder,
      backupName,
      { operation: currentOperation, onProgress, exact: options.exact }
    );
    return {
      success: !cancelled,
      sounds,
      removed,
      cancelled,
      message: cancelled
        ? `Stopped. Not all sounds are on ${speakerName} yet.`
        : undefined,
    };
  } catch (e: any) {
    return {
      success: false,
      sounds: 0,
      cancelled: false,
      message: inPlainWords(e),
    };
  } finally {
    currentOperation = null;
  }
};

/**
 * Give a new speaker its number, add it to the swarm and put its sounds back
 * @param event
 * @param request Which speaker, which number and which saved sounds
 */
export const adoptSpeaker = async (
  event: Electron.IpcMainInvokeEvent,
  request: IAdoptSpeakerRequest
): Promise<IAdoptSpeakerResult> => {
  const { ipAddress, id, backupName } = request;
  const result: IAdoptSpeakerResult = {
    numberGiven: false,
    cameBack: false,
    soundsRestored: false,
    sounds: 0,
  };

  try {
    if (!isValidBeeNumber(id))
      throw new SpeakerAdoptionError("Choose a number from 1 to 99.");

    // a bee with this number that is switched on would get a twin
    if (KweenBGlobal.kweenb.beeStates.isOnline(id))
      throw new SpeakerAdoptionError(
        `Bee ${id} is already switched on. Two speakers cannot share a number. Choose another number, or switch off the other bee ${id} first.`
      );

    const fixedAddress = fixedAddressOfBee(
      id,
      BEE_ADDRESS_PREFIX,
      BEE_ADDRESS_OFFSET
    );

    // give the number and wait for the speaker on its fixed address
    sendAdoptSpeakerProgress({ step: "number" });
    try {
      await giveNumber(ipAddress, id, fixedAddress, {
        onWaiting: () => {
          result.numberGiven = true;
          sendAdoptSpeakerProgress({ step: "waiting" });
        },
      });
      result.cameBack = true;
    } catch (e: any) {
      // without its number the speaker is still a new speaker
      if (!result.numberGiven) throw e;
      result.message = `${inPlainWords(
        e
      )} It was added to your swarm and shows up as soon as it can be reached.`;
    }

    // from here on the speaker is a bee of the swarm
    await saveAdoptedBee(id, fixedAddress);
    if (!result.cameBack) return result;

    // put its sounds back
    if (backupName) {
      const speakerName = backupNameOfBee(id);
      sendAdoptSpeakerProgress({ step: "sounds", current: 0, total: 0 });
      // a backup in the cloud is fetched first (that controller is loaded
      // here, because it needs this one itself)
      let folder: string | undefined;
      if (request.backupSource === "cloud") {
        const { fetchBackupOfBee } = await import("./cloud-backup");
        const fetched = await fetchBackupOfBee(backupName);
        if (!fetched.folder) {
          result.message = `The speaker has its number, but its sounds could not be fetched from the cloud. ${
            fetched.message || ""
          }`;
          return result;
        }
        folder = fetched.folder;
      }
      const restored = await restoreSoundsToSpeaker(
        fixedAddress,
        speakerName,
        backupName,
        (current, total) =>
          sendAdoptSpeakerProgress({ step: "sounds", current, total }),
        { folder }
      );
      result.soundsRestored = restored.success;
      result.sounds = restored.sounds;
      result.message = restored.message;
    }
    return result;
  } catch (e: any) {
    result.message = inPlainWords(e);
    return result;
  }
};

/**
 * Stop saving or putting back sounds
 */
export const cancelSounds = () => {
  if (!currentOperation) return;
  currentOperation.cancelled = true;
  try {
    if (currentOperation.abort) currentOperation.abort();
  } catch (e) {
    // Ignore errors when stopping
  }
};

/**
 * The speakers on the network that have no number yet. Looking for them
 * starts with the first call and goes on as long as this is called.
 */
export const findNewSpeakers = (): IFoundSpeaker[] =>
  speakerDiscovery.find().filter((speaker) => speaker.id === null);

// how long is looked for bees on the network
const ADOPT_LOOK_MS = 6000;

/**
 * Look for the bees that are switched on in the network and add the ones
 * KweenB does not know yet. A bee is a speaker that has its number; a
 * speaker without a number needs "New Speaker" first.
 */
export const adoptFromNetwork = async (): Promise<IAdoptFromNetworkResult> => {
  // looking goes on as long as it is asked for
  const deadline = Date.now() + ADOPT_LOOK_MS;
  let found: IFoundSpeaker[] = speakerDiscovery.find();
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    found = speakerDiscovery.find();
  }
  speakerDiscovery.stop();

  const result: IAdoptFromNetworkResult = {
    added: [],
    known: [],
    withoutNumber: found.filter((speaker) => speaker.id === null).length,
    doubleNumbers: [],
  };
  const seen = new Set<number>();
  for (const speaker of found) {
    if (speaker.id === null) continue;
    // two speakers with the same number: only the first is taken
    if (seen.has(speaker.id)) {
      if (!result.doubleNumbers.includes(speaker.id))
        result.doubleNumbers.push(speaker.id);
      continue;
    }
    seen.add(speaker.id);
    const bee = { id: speaker.id, name: backupNameOfBee(speaker.id) };
    // eslint-disable-next-line no-await-in-loop
    const existing = await Bee.findOne({ where: { id: speaker.id } });
    if (existing && existing.ipAddress === speaker.ipAddress) {
      result.known.push(bee);
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    await saveAdoptedBee(speaker.id, speaker.ipAddress);
    result.added.push(bee);
  }
  const byNumber = (a: { id: number }, b: { id: number }) => a.id - b.id;
  result.added.sort(byNumber);
  result.known.sort(byNumber);
  return result;
};

/**
 * The sounds that are saved on this computer
 */
export const getSoundBackups = async (): Promise<ISoundBackup[]> => {
  try {
    const backups = await SoundBackup.listBackups(await getBackupFolder());
    return backups.filter((backup) => backup.sounds > 0);
  } catch (e) {
    // a folder that can not be read has nothing to offer
    return [];
  }
};

/**
 * Put saved sounds on a bee
 * @param event
 * @param beeId The number of the bee
 * @param backupName The saved sounds (the name of the bee they came from)
 */
export const restoreSounds = async (
  event: Electron.IpcMainInvokeEvent,
  beeId: number,
  backupName: string,
  // also take the sounds off the bee that are not in the saved sounds
  exact: boolean = false,
  // another folder than the backup folder (sounds fetched from the cloud)
  folder?: string
): Promise<IRestoreSoundsResult> => {
  let bee: IBee;
  try {
    bee = await BeeHelpers.getBee(beeId);
  } catch (e: any) {
    return {
      success: false,
      sounds: 0,
      cancelled: false,
      message: `Bee ${beeId} is not in your swarm.`,
    };
  }
  return restoreSoundsToSpeaker(
    bee.ipAddress,
    bee.name,
    backupName,
    (current, total, sound) =>
      sendSoundsProgress({
        action: "restore",
        name: bee.name,
        current,
        total,
        sound,
      }),
    { exact: exact === true, folder }
  );
};

/**
 * Save the sounds of bees on this computer
 * @param event
 * @param beeIds The numbers of the bees, all bees that are switched on when left out
 */
export const saveSounds = async (
  event: Electron.IpcMainInvokeEvent,
  beeIds?: number[]
): Promise<ISaveSoundsResult> => {
  const folder = await getBackupFolder();
  const result: ISaveSoundsResult = {
    folder,
    saved: [],
    failed: [],
    cancelled: false,
  };

  if (currentOperation) return { ...result, message: BUSY_MESSAGE };
  currentOperation = { cancelled: false };

  try {
    const allBees = await BeeHelpers.getAllBees(BeeActiveState.ALL);
    const bees = beeIds
      ? allBees.filter((bee) => beeIds.includes(bee.id))
      : allBees.filter((bee) => bee.isOnline);

    if (bees.length === 0)
      return {
        ...result,
        message:
          "No bee is switched on right now. Switch on the bees you want to back up and try again.",
      };

    // one bee after the other: together they would only share the same network
    for (const bee of bees) {
      if (currentOperation.cancelled) break;
      const name = backupNameOfBee(bee.id);

      if (!bee.isOnline) {
        result.failed.push({
          name,
          message: "It is switched off. Switch it on and try again.",
        });
        continue;
      }

      try {
        const saved = await SoundBackup.backupBee(bee.ipAddress, folder, name, {
          operation: currentOperation,
          onProgress: (current, total, sound) =>
            sendSoundsProgress({ action: "save", name, current, total, sound }),
        });
        if (saved.cancelled) break;
        if (saved.nothingToSave)
          result.failed.push({
            name,
            message:
              "There are no sounds on it. What was saved before is left as it was.",
          });
        else result.saved.push({ name, sounds: saved.sounds });
      } catch (e: any) {
        result.failed.push({ name, message: inPlainWords(e) });
      }
    }

    result.cancelled = currentOperation.cancelled;
    return result;
  } catch (e: any) {
    return { ...result, message: inPlainWords(e) };
  } finally {
    currentOperation = null;
  }
};

/**
 * Stop looking for speakers
 */
export const stopLookingForSpeakers = () => {
  speakerDiscovery.stop();
};
