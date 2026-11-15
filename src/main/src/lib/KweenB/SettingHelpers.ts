/**
 * All helpers for settings
 */

import { ISetting, ISettings } from "@shared/interfaces";
import fs from "fs";

// import the setting model
import Setting from "../../models/Setting";
import {
  BEE_JACK_DEVICE,
  DEFAULT_BACKUP_FOLDER,
  JACKTRIP_BUFFER_STRATEGY,
  SETTINGS_VERSION,
  START_PORT_JACKTRIP,
} from "../../consts";

/**
 * The settings that are no longer stored: they were either without effect
 * or the same for every installation.
 */
const OBSOLETE_SETTING_KEYS = [
  "beeJackDevice",
  "beeJackInputChannels",
  "beeJackOutputChannels",
  "beeJackBufferSize",
  "beeJackSampleRate",
  "beeJacktripBitRate",
  "beeJacktripBufferStrategy",
  "beeJacktripChannels",
  "beeJacktripLocalPort",
  "beeJacktripRealtimePriority",
  "beeJacktripReceiveChannels",
  "beeJacktripRedundancy",
  "beeJacktripSendChannels",
  "kweenbJackBufferSize",
  "kweenbJackInputChannels",
  "kweenbJackOutputChannels",
  "kweenbJackPeriods",
  "kweenbJackSampleRate",
  "kweenbJacktripBitRate",
  "kweenbJacktripBufferStrategy",
  "kweenbJacktripChannels",
  "kweenbJacktripLocalPort",
  "kweenbJacktripQueueBufferLength",
  "kweenbJacktripRealtimePriority",
  "kweenbJacktripReceiveChannels",
  "kweenbJacktripSendChannels",
  "kweenbHubModeClusterSize",
  // the bees are no longer reached over SSH
  "kweenbSshKeyPath",
  "thekweenIpAddress",
];

/**
 * Get the settings
 * @returns
 */
const getAllSettings = async (): Promise<ISettings> => {
  // find all the settings
  const settings = await Setting.findAll();

  // create an inner function to find a setting easy
  const findKey = (key: string) => settings.find((s) => s.key === key);

  // the audio format of the stream is the same on kweenb and on every bee
  const sampleRate = Number(findKey("audioSampleRate")?.value || 44100);
  const bufferSize = Number(findKey("audioBufferSize")?.value || 512);
  const bitRate = Number(findKey("audioBitRate")?.value || 16);

  // the buffer that waits for late network packets, in milliseconds
  const queueBufferLength = Number(
    findKey("beeJacktripQueueBufferLength")?.value || 30
  );

  // every bee receives (and sends back) exactly one channel
  const jacktripFixedSettings = {
    bitRate,
    bufferStrategy: JACKTRIP_BUFFER_STRATEGY,
    channels: 1,
    localPort: START_PORT_JACKTRIP,
    queueBufferLength,
    realtimePriority: true,
    receiveChannels: 1,
    sendChannels: 1,
  };

  return {
    beeAudioSettings: {
      jack: {
        device: BEE_JACK_DEVICE,
        bufferSize,
        sampleRate,
        inputChannels: -1,
        outputChannels: -1,
        periods: Number(findKey("beeJackPeriods")?.value || 3),
      },
      jacktrip: {
        ...jacktripFixedSettings,
        // what a bee sends back is silence, so sending it once is enough
        redundancy: 1,
      },
    },
    kweenBAudioSettings: {
      jack: {
        device: findKey("kweenbJackDevice")?.value || "",
        bufferSize,
        sampleRate,
        inputChannels: -1,
        outputChannels: -1,
        // periods only exist for the sound card of a bee
        periods: -1,
      },
      jacktrip: {
        ...jacktripFixedSettings,
        redundancy: Number(findKey("kweenbJacktripRedundancy")?.value || 1),
      },
    },
    kweenBSettings: {
      jackFolderPath: String(findKey("kweenbJackFolderPath")?.value || ""),
      jacktripBinPath: String(findKey("kweenbJacktripBinPath")?.value || ""),
      backupFolder: String(
        findKey("kweenbBackupFolder")?.value || DEFAULT_BACKUP_FOLDER
      ),
      lastImagePath: String(findKey("kweenbLastImagePath")?.value || ""),
    },
    positioningSettings: {
      updateRate: Number(findKey("positioningUpdateRate")?.value) || 200,
    },
  };
};

/**
 * Bring the stored settings of an earlier kweenb version up to date.
 * Runs once: afterwards the settings carry the current version.
 */
const migrateSettings = async () => {
  const version = await Setting.findOne({ where: { key: "settingsVersion" } });
  if (version?.value === SETTINGS_VERSION) return;

  const valueOf = async (key: string) =>
    (await Setting.findOne({ where: { key } }))?.value;
  const set = async (key: string, value: string) => {
    if (await Setting.findOne({ where: { key } }))
      await Setting.update({ value }, { where: { key } });
    else await Setting.create({ key, value });
  };

  // the audio format used to be stored twice (bees and kweenb)
  await set("audioSampleRate", (await valueOf("beeJackSampleRate")) || "44100");
  await set("audioBufferSize", (await valueOf("beeJackBufferSize")) || "512");
  await set("audioBitRate", (await valueOf("beeJacktripBitRate")) || "16");

  // the queue buffer changed from a number of packets to milliseconds, and
  // the old defaults (32 packets, 24 periods) added more than half a second
  await set("beeJacktripQueueBufferLength", "30");
  await set("beeJackPeriods", "3");

  // redundancy on kweenb had no effect in hub mode before
  await set("kweenbJacktripRedundancy", "1");

  await Setting.destroy({ where: { key: OBSOLETE_SETTING_KEYS } });
  await set("settingsVersion", SETTINGS_VERSION);
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
  migrateSettings,
  updateSetting,
};
