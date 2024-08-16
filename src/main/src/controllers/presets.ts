import { IAudioPreset, IError } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import presetsHelper from "../lib/KweenB/PresetHelpers";
import { AppMode } from "@shared/enums";
import { DEFAULT_APP_MODE } from "@shared/consts";

/**
 * Activate a preset
 * @param fileName
 */
export const activatePreset = async (
  event: Electron.IpcMainInvokeEvent,
  fileName: string
): Promise<IError> => {
  try {
    return await presetsHelper.activatePreset(fileName);
  } catch (e: any) {
    throw new KweenBException(
      { where: "activatePreset()", message: e.message },
      true
    );
  }
};

/**
 * Get all the audio presets
 */
export const getAudioPresets = async (
  event: Electron.IpcMainInvokeEvent,
  appMode: AppMode = DEFAULT_APP_MODE
): Promise<IAudioPreset[]> => {
  try {
    return await presetsHelper.getAudioPresets(appMode);
  } catch (e: any) {
    throw new KweenBException(
      { where: "getAudioPresets()", message: e.message },
      true
    );
  }
};
