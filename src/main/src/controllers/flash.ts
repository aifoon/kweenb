/**
 * Flashing a speaker: choosing the image, opening the storage of the speaker
 * over the USB cable and writing the image to it
 */

import { app, dialog } from "electron";
import fs from "fs";
import path from "path";
import {
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
} from "../lib/SpeakerFlash/SpeakerFlash";

// the folder with the tool that opens the storage of a speaker
const USBBOOT_FOLDER = path.join(resourcesPath, "usbboot");

// one speaker is looked for or flashed at a time
let currentOperation: FlashOperation | null = null;

// looking for a speaker, as long as that is going on
let looking: Promise<IFlashStorageResult> | null = null;

// the storage of the speaker that was found. It never leaves the main
// process: the renderer only gets to know its size.
let speakerStorage: DiskInfo | null = null;

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
const describeImage = (imagePath: string): IFlashImage | null => {
  try {
    return {
      path: imagePath,
      name: path.basename(imagePath),
      sizeBytes: fs.statSync(imagePath).size,
      message: whyImageCannotBeUsed(imagePath) || undefined,
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
export const chooseFlashImage = async (): Promise<IFlashImage | null> => {
  const { lastImagePath } = (await SettingHelpers.getAllSettings())
    .kweenBSettings;
  const { canceled, filePaths } = await dialog.showOpenDialog(
    KweenBGlobal.kweenb.mainWindow,
    {
      title: "Choose the image for the speaker",
      defaultPath: lastImagePath ? path.dirname(lastImagePath) : undefined,
      properties: ["openFile"],
      // a name like image.img.gz ends in gz for the file dialog
      filters: [{ name: "Images", extensions: ["img", "gz", "xz"] }],
    }
  );
  if (canceled || filePaths.length === 0) return null;

  const image = describeImage(filePaths[0]);
  if (image && !image.message)
    await SettingHelpers.updateSetting({
      key: "kweenbLastImagePath",
      value: image.path,
    });
  return image;
};

/**
 * The image that was used the last time
 * @returns null when there is none (any more)
 */
export const getLastFlashImage = async (): Promise<IFlashImage | null> => {
  try {
    const { lastImagePath } = (await SettingHelpers.getAllSettings())
      .kweenBSettings;
    return lastImagePath ? describeImage(lastImagePath) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Look for the speaker that is connected with a USB cable and open its
 * storage. Goes on until a speaker is found or looking is stopped.
 */
const lookForSpeakerToFlash = async (): Promise<IFlashStorageResult> => {
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
    speakerStorage = await openSpeakerStorage(USBBOOT_FOLDER, operation, () =>
      sendFlashProgress({ step: "found" })
    );
    return { ...result, found: true, sizeBytes: speakerStorage.sizeBytes };
  } catch (e: any) {
    if (e instanceof FlashError)
      return { ...result, cancelled: e.cancelled, message: e.message };
    console.error(e);
    return {
      ...result,
      message: "Something went wrong while looking for the speaker. Try again.",
    };
  } finally {
    currentOperation = null;
  }
};

export const findSpeakerToFlash = async (): Promise<IFlashStorageResult> => {
  // looking that was stopped a moment ago gets to end first
  if (looking) {
    cancelFlash();
    await looking;
  }
  const thisLooking = lookForSpeakerToFlash();
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
  imagePath: string
): Promise<IFlashSpeakerResult> => {
  if (process.platform !== "darwin")
    return { success: false, cancelled: false, message: ONLY_ON_A_MAC_MESSAGE };
  if (currentOperation)
    return { success: false, cancelled: false, message: BUSY_MESSAGE };

  // the storage is used once: afterwards the speaker has to be found again
  const storage = speakerStorage;
  speakerStorage = null;
  if (!storage)
    return {
      success: false,
      cancelled: false,
      message:
        "KweenB does not know which speaker to flash any more. Switch the speaker off and on, and start again.",
    };

  const operation: FlashOperation = { cancelled: false };
  currentOperation = operation;
  try {
    await flashSpeakerStorage(
      String(imagePath),
      storage,
      operation,
      (step, percentage) => sendFlashProgress({ step, percentage })
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
        "Something went wrong while writing the image. Switch the speaker off and on, and flash it again.",
    };
  } finally {
    currentOperation = null;
  }
};
