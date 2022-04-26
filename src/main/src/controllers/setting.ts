/**
 * The setting controller
 */

import { ISettings, ISetting } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import SettingHelpers from "../lib/KweenB/SettingHelpers";

/**
 * Fetch all the settings
 * @returns ISetting[]
 */
export const fetchSettings = async (): Promise<ISettings> => {
  try {
    return await SettingHelpers.getAllSettings();
  } catch (e: any) {
    throw new KweenBException(
      { where: "fetchKweenBSettings", message: e.message },
      true
    );
  }
};

/**
 * Update a KweenB setting
 * @param event The event
 * @param setting The setting formed as ISetting
 */
export const updateSetting = async (
  event: Electron.IpcMainInvokeEvent,
  setting: ISetting
) => {
  try {
    await SettingHelpers.updateSetting(setting);
  } catch (e: any) {
    throw new KweenBException({ where: "updateBee", message: e.message });
  }
};
