/**
 * The setting controller
 */

import { IKweenBSettings, ISetting } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import { getAllSettings, updateSetting } from "../lib/KweenB/SettingHelpers";

/**
 * Fetch all the settings
 * @returns ISetting[]
 */
export const fetchKweenBSettings = async (): Promise<IKweenBSettings> => {
  try {
    return await getAllSettings();
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
export const updateKweenBSetting = async (
  event: Electron.IpcMainInvokeEvent,
  setting: ISetting
) => {
  try {
    await updateSetting(setting);
  } catch (e: any) {
    throw new KweenBException({ where: "updateBee", message: e.message });
  }
};
