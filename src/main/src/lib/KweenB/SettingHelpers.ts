/**
 * All helpers for settings
 */

import { IKweenBSettings, ISetting } from "@shared/interfaces";
import Setting from "../../models/Setting";

/**
 * Get the settings
 * @returns
 */
const getAllSettings = async (): Promise<IKweenBSettings> => {
  // find all the settings
  const settings = await Setting.findAll();

  // create an inner function to find a setting easy
  const findKey = (key: string) => settings.find((s) => s.key === key);

  // we need to create IBeeAudioSettings, ITheKweenSettings, IKweenBAudioSettings
  return {
    beeAudioSettings: {
      channels: Number(findKey("beeChannels")?.value || 0),
      jack: {
        device: findKey("beeJackDevice")?.value || "",
        bufferSize: Number(findKey("beeJackBufferSize")?.value || 16),
        sampleRate: Number(findKey("beeJackSampleRate")?.value || 48000),
        periods: Number(findKey("beeJackPeriods")?.value || 2),
      },
      jacktrip: {
        bitRate: Number(findKey("beeJacktripBitRate")?.value || 16),
        queueBufferLength: Number(
          findKey("beeJacktripQueueBufferLength")?.value || 4
        ),
        redundancy: Number(findKey("beeJacktripRedundancy")?.value || 1),
        realtimePriority: Boolean(
          findKey("beeJacktripRealtimePriority")?.value === "true"
        ),
        sendChannels: Number(findKey("beeJacktripSendChannels")?.value || 2),
        receiveChannels: Number(
          findKey("beeJacktripReceiveChannels")?.value || 2
        ),
      },
    },
    kweenBAudioSettings: {
      channels: Number(findKey("kweenbChannels")?.value || 2),
      mqttBroker: String(findKey("kweenbMqttBroker")?.value || ""),
    },
    theKweenSettings: {
      ipAddress: findKey("thekweenIpAddress")?.value || "127.0.0.1",
    },
  };
};

/**
 * Update a setting in the database
 *
 * @param setting The setting
 */
const updateSetting = async (setting: ISetting) => {
  if (!setting.key)
    throw new Error("Please provide a valid key for the requested setting.");
  await Setting.update(setting, { where: { key: setting.key } });
};

export { getAllSettings, updateSetting };
