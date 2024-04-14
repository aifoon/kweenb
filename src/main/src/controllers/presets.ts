import { IAudioPreset } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import presetsHelper from "../lib/KweenB/PresetHelpers";

/**
 * Get all the audio presets
 */
export const getAudioPresets = async (): Promise<IAudioPreset[]> => {
  try {
    return await presetsHelper.getAudioPresets();
  } catch (e: any) {
    throw new KweenBException(
      { where: "getAudioPresets()", message: e.message },
      true
    );
  }
};

/**
 * Activate a preset
 * @param fileName
 */
export const activatePreset = async (
  event: Electron.IpcMainInvokeEvent,
  fileName: string
): Promise<void> => {
  try {
    return await presetsHelper.activatePreset(fileName);
  } catch (e: any) {
    throw new KweenBException(
      { where: "activatePreset()", message: e.message },
      true
    );
  }
};
