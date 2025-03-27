/**
 * All helpers for settings
 */

import { ISetting, ISettings } from "@shared/interfaces";
import fs from "fs";

// import the setting model
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
        localPort: Number(findKey("beeJacktripLocalPort")?.value || 4464),
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
        localPort: Number(findKey("kweenbJacktripLocalPort")?.value || 4464),
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
      jackFolderPath: String(findKey("kweenbJackFolderPath")?.value || ""),
      jacktripBinPath: String(findKey("kweenbJacktripBinPath")?.value || ""),
    },
    positioningSettings: {
      updateRate: Number(findKey("positioningUpdateRate")?.value) || 200,
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
  const requestedSetting = await Setting.findOne({
    where: { key: setting.key },
  });
  if (!requestedSetting)
    await Setting.create({ key: setting.key, value: setting.value });
  else await Setting.update(setting, { where: { key: setting.key } });
};

/**
 * Export the settings to a json file
 */
const exportSettings = async (filePath: string) => {
  // if no file is given, do not write
  if (!filePath) return;

  // write the file
  fs.writeFileSync(filePath, JSON.stringify(await Setting.findAll()), "utf8");
};

/**
 * Import the settings in the database
 * @param filePath The filepath
 */
const importSettings = async (filePath: string) => {
  // if no file is given to do not import
  if (!filePath) return;

  // get the data from file
  const data = fs.readFileSync(filePath);

  // convert to json
  const settingsData = JSON.parse(data.toString());

  // validate the data
  if (!Array.isArray(settingsData) || settingsData.length === 0) return;

  // create a helper function
  const equals = (a: string[], b: string[]) =>
    JSON.stringify(a) === JSON.stringify(b);

  // create the expected array result
  const expectedObjectKeys = ["id", "key", "value", "createdAt", "updatedAt"];

  // eslint-disable-next-line no-restricted-syntax
  for (const setting of settingsData) {
    const objectKeys = Object.keys(setting);
    if (!equals(objectKeys, expectedObjectKeys)) return;
  }
  try {
    // loop over settings and update
    settingsData.forEach(async (setting) => {
      await Setting.upsert({ key: setting.key, value: setting.value });
    });
  } catch (e) {
    console.error(e);
  }
};

export default {
  exportSettings,
  importSettings,
  getAllSettings,
  updateSetting,
};
