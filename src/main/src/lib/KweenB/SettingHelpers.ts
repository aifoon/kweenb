/**
 * All helpers for settings
 */

import { ISetting, ISettings } from "@shared/interfaces";
import Setting from "../../models/Setting";

/**
 * Get the settings
 * @returns
 */
const getAllSettings = async (): Promise<ISettings> => {
  // find all the settings
  const settings = await Setting.findAll();

  // create an inner function to find a setting easy
  const findKey = (key: string) => settings.find((s) => s.key === key);

  // we need to create IBeeAudioSettings, ITheKweenSettings, IKweenBAudioSettings & IKweenBSettings
  return {
    beeAudioSettings: {
      jack: {
        device: findKey("beeJackDevice")?.value || "",
        bufferSize: Number(findKey("beeJackBufferSize")?.value || 16),
        sampleRate: Number(findKey("beeJackSampleRate")?.value || 48000),
        inputChannels: Number(findKey("beeJackInputChannels")?.value || 2),
        outputChannels: Number(findKey("beeJackOutputChannels")?.value || 2),
        periods: Number(findKey("beeJackPeriods")?.value || 2),
      },
      jacktrip: {
        bitRate: Number(findKey("beeJacktripBitRate")?.value || 16),
        channels: Number(findKey("beeJacktripChannels")?.value || 2),
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
      jack: {
        device: findKey("kweenbJackDevice")?.value || "",
        bufferSize: Number(findKey("kweenbJackBufferSize")?.value || 16),
        sampleRate: Number(findKey("kweenbJackSampleRate")?.value || 48000),
        inputChannels: Number(findKey("kweenbJackInputChannels")?.value || 2),
        outputChannels: Number(findKey("kweenbJackOutputChannels")?.value || 2),
        periods: Number(findKey("kweenbJackPeriods")?.value || 2),
      },
      jacktrip: {
        bitRate: Number(findKey("kweenbJacktripBitRate")?.value || 16),
        queueBufferLength: Number(
          findKey("kweenbJacktripQueueBufferLength")?.value || 4
        ),
        channels: Number(findKey("kweenbJacktripChannels")?.value || 2),
        redundancy: Number(findKey("kweenbJacktripRedundancy")?.value || 1),
        realtimePriority: Boolean(
          findKey("kweenbJacktripRealtimePriority")?.value === "true"
        ),
        sendChannels: Number(
          findKey("kweenbJacktripSendChannels")?.value || 16
        ),
        receiveChannels: Number(
          findKey("kweenbJacktripReceiveChannels")?.value || 16
        ),
      },
    },
    kweenBSettings: {
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

export default { getAllSettings, updateSetting };
