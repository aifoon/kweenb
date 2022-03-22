/**
 * The setting controller
 */

import { IKweenBSettings, ISetting } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import Setting from "../models/Setting";

/**
 * Fetch all the settings
 * @returns ISetting[]
 */
export const fetchKweenBSettings = async (): Promise<IKweenBSettings> => {
  try {
    // find all the settings
    const settings = await Setting.findAll();

    // create an inner function to find a setting easy
    const findKey = (key: string) => settings.find((s) => s.key === key);

    // we need to create IBeeAudioSettings, ITheKweenSettings, IKweenBAudioSettings
    return {
      beeAudioSettings: {
        channels: Number(findKey("beeChannels")?.value || 0),
        jack: {
          bufferSize: Number(findKey("beeJackBufferSize")?.value || 16),
          sampleRate: Number(findKey("beeJackSampleRate")?.value || 48000),
        },
        jacktrip: {
          bitRate: Number(findKey("beeJacktripBitRate")?.value || 16),
          queueBufferLength: Number(
            findKey("beeJacktripQueueBufferLength")?.value || 4
          ),
          redundancy: Number(findKey("beeJacktripRedundancy")?.value || 1),
        },
      },
      kweenBAudioSettings: {
        channels: Number(findKey("kweenbChannels")?.value || 2),
      },
      theKweenSettings: {
        ipAddress: findKey("thekweenIpAddress")?.value || "127.0.0.1",
      },
    };
  } catch (e: any) {
    throw new KweenBException(
      { message: `fetchSettings(): ${e.message}` },
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
    console.log(setting);
    if (!setting.key)
      throw new Error("Please provide a valid key for the requested setting.");
    Setting.update(setting, { where: { key: setting.key } });
  } catch (e: any) {
    throw new KweenBException({ message: `updateBee(): ${e.message}` });
  }
};
