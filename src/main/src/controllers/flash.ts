/**
 * Flashing a speaker: choosing the image, opening the storage of the speaker
 * over the USB cable and writing the image to it
 */

import { app, dialog } from "electron";
import fs from "fs";
import path from "path";
import {
  FlashKind,
  IFlashImage,
  IFlashProgress,
  IFlashSpeakerResult,
  IFlashStorageResult,
} from "@shared/interfaces";
import { resourcesPath } from "@shared/resources";
import { KweenBGlobal } from "../kweenb";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import { DiskInfo } from "../lib/SpeakerFlash/DiskSelection";
import { whyImageCannotBeUsed } from "../lib/SpeakerFlash/ImageFeeder";
import {
  FlashError,
  FlashOperation,
  flashSpeakerStorage,
  openSpeakerStorage,
  waitForSatelliteCard,
} from "../lib/SpeakerFlash/SpeakerFlash";

// the folder with the tool that opens the storage of a speaker
const USBBOOT_FOLDER = path.join(resourcesPath, "usbboot");

// one speaker is looked for or flashed at a time
let currentOperation: FlashOperation | null = null;

// looking for a speaker, as long as that is going on
let looking: Promise<IFlashStorageResult> | null = null;

// the storage of the speaker (or the card of the satellite) that was found.
// It never leaves the main process: the renderer only gets to know its size.
let speakerStorage: DiskInfo | null = null;
// what it was found for: a card is never flashed as a speaker, or the other
// way round
let storageKind: FlashKind = "speaker";

const kindOf = (kind: unknown): FlashKind =>
  kind === "satellite" ? "satellite" : "speaker";

const lastImageKeyOf = (kind: FlashKind) =>
  kind === "satellite" ? "kweenbLastSatelliteImagePath" : "kweenbLastImagePath";

const lastImagePathOf = async (kind: FlashKind): Promise<string> => {
  const { kweenBSettings } = await SettingHelpers.getAllSettings();
  return kind === "satellite"
    ? kweenBSettings.lastSatelliteImagePath
    : kweenBSettings.lastImagePath;
};

/**
 * Does the name of an image say that it is made for the other thing: the
 * images are called zwerm3-speaker-… and zwerm3-satellite-…
 */
const whyImageIsForSomethingElse = (
  imagePath: string,
  kind: FlashKind
): string | null => {
  const name = path.basename(imagePath).toLowerCase();
  if (kind === "satellite" && name.includes("speaker"))
    return "This is the image of a speaker. Choose the image of the satellite (zwerm3-satellite-….img.gz).";
  if (kind === "speaker" && name.includes("satellite"))
    return "This is the image of the satellite. Choose the image of the speakers (zwerm3-speaker-….img.gz).";
  return null;
};

const BUSY_MESSAGE =
  "KweenB is still busy with a speaker. Wait until that is finished and try again.";

const ONLY_ON_A_MAC_MESSAGE =
  "Flashing a speaker with KweenB only works on a Mac for now. On this computer, use Raspberry Pi Imager.";

/**
 * Let the renderer know how far flashing is
 */
const sendFlashProgress = (progress: IFlashProgress) => {
  const { mainWindow } = KweenBGlobal.kweenb;
  if (mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("flash-progress", progress);
};

/**
 * Describe an image file for the renderer
 * @param imagePath
 * @returns null when the file is not there (any more)
 */
const describeImage = (
  imagePath: string,
  kind: FlashKind
): IFlashImage | null => {
  try {
    return {
      path: imagePath,
      name: path.basename(imagePath),
      sizeBytes: fs.statSync(imagePath).size,
      message:
        whyImageCannotBeUsed(imagePath) ||
        whyImageIsForSomethingElse(imagePath, kind) ||
        undefined,
    };
  } catch (e) {
    return null;
  }
};

/**
 * Stop looking for a speaker or writing to it
 */
export const cancelFlash = () => {
  if (!currentOperation) return;
  currentOperation.cancelled = true;
  try {
    if (currentOperation.abort) currentOperation.abort();
  } catch (e) {
    // Ignore errors when stopping
  }
};

// nothing keeps running when KweenB closes
app.on("before-quit", cancelFlash);

/**
 * Let the user choose the image to flash. The choice is remembered.
 * @returns null when nothing was chosen
 */
export const chooseFlashImage = async (
  event: Electron.IpcMainInvokeEvent,
  forKind?: FlashKind
): Promise<IFlashImage | null> => {
  const kind = kindOf(forKind);
  const lastImagePath = await lastImagePathOf(kind);
  const { canceled, filePaths } = await dialog.showOpenDialog(
    KweenBGlobal.kweenb.mainWindow,
    {
      title:
        kind === "satellite"
          ? "Choose the image for the satellite"
          : "Choose the image for the speaker",
      defaultPath: lastImagePath ? path.dirname(lastImagePath) : undefined,
      properties: ["openFile"],
      // a name like image.img.gz ends in gz for the file dialog
      filters: [{ name: "Images", extensions: ["img", "gz", "xz"] }],
    }
  );
  if (canceled || filePaths.length === 0) return null;

  const image = describeImage(filePaths[0], kind);
  if (image && !image.message)
    await SettingHelpers.updateSetting({
      key: lastImageKeyOf(kind),
      value: image.path,
    });
  return image;
};

/**
 * The image that was used the last time
 * @returns null when there is none (any more)
 */
export const getLastFlashImage = async (
  event: Electron.IpcMainInvokeEvent,
  forKind?: FlashKind
): Promise<IFlashImage | null> => {
  try {
    const kind = kindOf(forKind);
    const lastImagePath = await lastImagePathOf(kind);
    return lastImagePath ? describeImage(lastImagePath, kind) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Look for the speaker that is connected with a USB cable and open its
 * storage. Goes on until a speaker is found or looking is stopped.
 */
const lookForSpeakerToFlash = async (
  kind: FlashKind
): Promise<IFlashStorageResult> => {
  const result: IFlashStorageResult = {
    found: false,
    cancelled: false,
    sizeBytes: 0,
  };
  if (process.platform !== "darwin")
    return { ...result, message: ONLY_ON_A_MAC_MESSAGE };
  if (currentOperation) return { ...result, message: BUSY_MESSAGE };

  const operation: FlashOperation = { cancelled: false };
  currentOperation = operation;
  speakerStorage = null;
  try {
    sendFlashProgress({ step: "looking" });
    storageKind = kind;
    speakerStorage =
      kind === "satellite"
        ? await waitForSatelliteCard(operation)
        : await openSpeakerStorage(USBBOOT_FOLDER, operation, () =>
            sendFlashProgress({ step: "found" })
          );
    return { ...result, found: true, sizeBytes: speakerStorage.sizeBytes };
  } catch (e: any) {
    if (e instanceof FlashError)
      return { ...result, cancelled: e.cancelled, message: e.message };
    console.error(e);
    return {
      ...result,
      message:
        kind === "satellite"
          ? "Something went wrong while looking for the card. Try again."
          : "Something went wrong while looking for the speaker. Try again.",
    };
  } finally {
    currentOperation = null;
  }
};

export const findSpeakerToFlash = async (
  event: Electron.IpcMainInvokeEvent,
  forKind?: FlashKind
): Promise<IFlashStorageResult> => {
  const kind = kindOf(forKind);
  // looking that was stopped a moment ago gets to end first
  if (looking) {
    cancelFlash();
    await looking;
  }
  const thisLooking = lookForSpeakerToFlash(kind);
  looking = thisLooking;
  try {
    return await thisLooking;
  } finally {
    if (looking === thisLooking) looking = null;
  }
};

/**
 * Write the image to the speaker that was found and check that it arrived
 * @param event
 * @param imagePath The image
 */
export const flashSpeaker = async (
  event: Electron.IpcMainInvokeEvent,
  imagePath: string,
  forKind?: FlashKind
): Promise<IFlashSpeakerResult> => {
  const kind = kindOf(forKind);
  if (process.platform !== "darwin")
    return { success: false, cancelled: false, message: ONLY_ON_A_MAC_MESSAGE };
  if (currentOperation)
    return { success: false, cancelled: false, message: BUSY_MESSAGE };

  // the storage is used once: afterwards the speaker has to be found again
  const storage = storageKind === kind ? speakerStorage : null;
  speakerStorage = null;
  if (!storage)
    return {
      success: false,
      cancelled: false,
      message:
        kind === "satellite"
          ? "KweenB does not know which card to flash any more. Take the card out and start again."
          : "KweenB does not know which speaker to flash any more. Switch the speaker off and on, and start again.",
    };

  // an image made for the other thing is never written
  const wrongImage = whyImageIsForSomethingElse(String(imagePath), kind);
  if (wrongImage)
    return { success: false, cancelled: false, message: wrongImage };

  const operation: FlashOperation = { cancelled: false };
  currentOperation = operation;
  try {
    await flashSpeakerStorage(
      USBBOOT_FOLDER,
      String(imagePath),
      storage,
      operation,
      (step, percentage) => sendFlashProgress({ step, percentage }),
      kind
    );
    return { success: true, cancelled: false };
  } catch (e: any) {
    if (e instanceof FlashError)
      return { success: false, cancelled: e.cancelled, message: e.message };
    console.error(e);
    return {
      success: false,
      cancelled: false,
      message:
        kind === "satellite"
          ? "Something went wrong while writing the image. Take the card out, put it back in, and flash it again."
          : "Something went wrong while writing the image. Switch the speaker off and on, and flash it again.",
    };
  } finally {
    currentOperation = null;
  }
};
