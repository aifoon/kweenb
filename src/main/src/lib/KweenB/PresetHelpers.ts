import { IAudioPreset } from "@shared/interfaces";
import fs from "fs";

// import { parse, stringify } from "yaml";
import { readdir } from "fs/promises";
import { PRESETS_FOLDER_PATH } from "../../consts";
import path, { parse } from "path";
import YAML from "yaml";
import SettingHelpers from "./SettingHelpers";
import { Utils } from "@shared/utils";
import { resourcesPath } from "@shared/resources";

/**
 * Active a preset
 * @param preset
 */
export const activatePreset = async (fileName: string): Promise<void> => {
  // read the file
  const filePath = path.join(PRESETS_FOLDER_PATH, fileName);
  const preset = fs.readFileSync(filePath, "utf8");

  // parse the preset
  const parsedPreset = YAML.parse(preset);
  parsedPreset.fileName = fileName;

  // convert to audio preset
  const audioPreset = parsedPreset as IAudioPreset;

  /**
   * Update bee settings
   */

  const beeKeysJack = Object.keys(audioPreset.bee.jack);
  const beeKeysJacktrip = Object.keys(audioPreset.bee.jacktrip);
  await Promise.all(
    beeKeysJack.map(async (beeKey) => {
      await SettingHelpers.updateSetting({
        key: `beeJack${Utils.capitalize(beeKey)}`,
        value:
          audioPreset.bee.jack[
            beeKey as keyof typeof audioPreset.bee.jack
          ].toString(),
      });
    })
  );
  await Promise.all(
    beeKeysJacktrip.map(async (beeKey) => {
      await SettingHelpers.updateSetting({
        key: `beeJacktrip${Utils.capitalize(beeKey)}`,
        value:
          audioPreset.bee.jacktrip[
            beeKey as keyof typeof audioPreset.bee.jacktrip
          ].toString(),
      });
    })
  );

  /**
   * Update kweenb settings
   */

  const kweenbKeysJack = Object.keys(audioPreset.kweenb.jack);
  const kweenbKeysJacktrip = Object.keys(audioPreset.kweenb.jacktrip);
  await Promise.all(
    kweenbKeysJack.map(async (kweenbKey) => {
      await SettingHelpers.updateSetting({
        key: `kweenbJack${Utils.capitalize(kweenbKey)}`,
        value:
          audioPreset.kweenb.jack[
            kweenbKey as keyof typeof audioPreset.kweenb.jack
          ]?.toString(),
      });
    })
  );
  await Promise.all(
    kweenbKeysJacktrip.map(async (kweenbKey) => {
      await SettingHelpers.updateSetting({
        key: `kweenbJacktrip${Utils.capitalize(kweenbKey)}`,
        value:
          audioPreset.kweenb.jacktrip[
            kweenbKey as keyof typeof audioPreset.kweenb.jacktrip
          ].toString(),
      });
    })
  );
};

/**
 * Initialize the presets folder
 */
export const initPresetsFolder = () => {
  try {
    // check if the presets folder exists
    const folderExists = fs.existsSync(PRESETS_FOLDER_PATH);

    // if the folder doesn't exist, create it
    if (!folderExists) {
      // create the presets folder
      fs.mkdirSync(PRESETS_FOLDER_PATH);

      // copy the default presets in resourcesPath to the presets folder
      const defaultPresetsPath = path.join(resourcesPath, "presets");
      const defaultPresets = fs.readdirSync(defaultPresetsPath);
      defaultPresets.forEach((preset) => {
        const presetPath = path.join(defaultPresetsPath, preset);
        const presetContent = fs.readFileSync(presetPath, "utf8");
        const presetFileName = path.basename(preset);
        fs.writeFileSync(
          path.join(PRESETS_FOLDER_PATH, presetFileName),
          presetContent
        );
      });
    }
  } catch (error) {
    throw new Error("Error initializing presets folder.");
  }
};

/**
 * Get audio presets
 * @returns
 */
export const getAudioPresets = async (): Promise<IAudioPreset[]> => {
  try {
    // read the files in the presets folder
    const files = await readdir(PRESETS_FOLDER_PATH);

    // only get YAML files
    const yamlFiles = files.filter((fileName) => {
      const extension = path.extname(fileName);
      return extension === ".yml" || extension === ".yaml";
    });

    // get the presets from YAML
    return yamlFiles.map((fileName) => {
      // parse the filepath
      const filePath = fs.readFileSync(
        path.join(PRESETS_FOLDER_PATH, fileName),
        "utf8"
      );

      // parse the yaml file
      const audioPreset = YAML.parse(filePath);
      audioPreset.fileName = fileName;

      // return the preset
      return audioPreset as IAudioPreset;
    });
  } catch (error) {
    throw new Error("Error getting audio presets.");
  }
};

export default {
  getAudioPresets,
  activatePreset,
};
