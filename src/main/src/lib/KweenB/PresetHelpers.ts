import { IAudioPreset, IError } from "@shared/interfaces";
import fs from "fs";

// import { parse, stringify } from "yaml";
import { readdir } from "fs/promises";
import { PRESETS_FOLDER_PATH } from "../../consts";
import path from "path";
import YAML from "yaml";
import SettingHelpers from "./SettingHelpers";
import { Utils } from "@shared/utils";
import { resourcesPath } from "@shared/resources";
import { AppMode, BeeActiveState } from "@shared/enums";
import { DEFAULT_APP_MODE } from "@shared/consts";
import BeeHelpers from "./BeeHelpers";

/**
 * Active a preset
 * @param preset
 */
export const activatePreset = async (fileName: string): Promise<IError> => {
  // read the file
  const filePath = path.join(PRESETS_FOLDER_PATH, fileName);
  const preset = fs.readFileSync(filePath, "utf8");

  // parse the preset
  const parsedPreset = YAML.parse(preset);
  parsedPreset.fileName = fileName;

  // convert to audio preset
  const audioPreset = parsedPreset as IAudioPreset;

  // check if the preset can be activated
  if (audioPreset.maxAllowedBees > 0) {
    const activeBees = await BeeHelpers.getAllBees(BeeActiveState.ACTIVE);
    if (activeBees.length > audioPreset.maxAllowedBees) {
      return {
        message: `The preset can only be activated with ${audioPreset.maxAllowedBees} bees.`,
        where: "activatePreset()",
      };
    }
  }

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

  return {
    message: "",
    where: "activatePreset()",
  };
};

/**
 * Initialize the presets folder
 */
export const initPresetsFolder = () => {
  try {
    // check if the presets folder exists
    const folderExists = fs.existsSync(PRESETS_FOLDER_PATH);

    // get the default presets path
    const defaultPresetsPath = path.join(resourcesPath, "presets");

    // if the folder doesn't exist, create it
    if (!folderExists) {
      // create the presets folder
      fs.mkdirSync(PRESETS_FOLDER_PATH);

      // copy the default presets in resourcesPath to the presets folder
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
    } else {
      // if folder exists, loop over the files in resourcesPath and copy them to the presets folder if they don't exist
      const defaultPresets = fs.readdirSync(defaultPresetsPath);
      defaultPresets.forEach((preset) => {
        const presetPath = path.join(defaultPresetsPath, preset);
        const presetFileName = path.basename(preset);
        const presetExists = fs.existsSync(
          path.join(PRESETS_FOLDER_PATH, presetFileName)
        );
        if (!presetExists) {
          const presetContent = fs.readFileSync(presetPath, "utf8");
          fs.writeFileSync(
            path.join(PRESETS_FOLDER_PATH, presetFileName),
            presetContent
          );
        }
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
export const getAudioPresets = async (
  appMode: AppMode = DEFAULT_APP_MODE
): Promise<IAudioPreset[]> => {
  try {
    // read the files in the presets folder
    const files = await readdir(PRESETS_FOLDER_PATH);

    // only get YAML files
    const yamlFiles = files.filter((fileName) => {
      const extension = path.extname(fileName);
      return extension === ".yml" || extension === ".yaml";
    });

    // get the presets from YAML
    const audioPresets = yamlFiles.map((fileName) => {
      // parse the filepath
      const filePath = fs.readFileSync(
        path.join(PRESETS_FOLDER_PATH, fileName),
        "utf8"
      );

      // parse the yaml file
      const audioPreset = YAML.parse(filePath) as IAudioPreset;
      audioPreset.fileName = fileName;

      // calculate the latency
      const latencyBee = Utils.calculateLatency(
        audioPreset.bee.jack.sampleRate,
        audioPreset.bee.jack.bufferSize,
        audioPreset.bee.jack.periods
      );
      const latencyKweenb = Utils.calculateLatency(
        audioPreset.kweenb.jack.sampleRate,
        audioPreset.kweenb.jack.bufferSize,
        audioPreset.kweenb.jack.periods
      );
      audioPreset.latency = Utils.roundToDecimals(
        latencyBee + latencyKweenb,
        2
      );

      // return the preset
      return audioPreset as IAudioPreset;
    });

    // filter the app mode
    let filteredAudioPresets = audioPresets.filter(
      (preset) => preset.appMode === appMode.toString()
    );

    // sort the presets by name
    filteredAudioPresets.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const startsWithNumberA = !isNaN(Number(nameA[0]));
      const startsWithNumberB = !isNaN(Number(nameB[0]));

      if (startsWithNumberA && !startsWithNumberB) {
        return 1;
      } else if (!startsWithNumberA && startsWithNumberB) {
        return -1;
      } else if (startsWithNumberA && startsWithNumberB) {
        const numberA = Number(nameA.match(/^\d+/)?.[0]);
        const numberB = Number(nameB.match(/^\d+/)?.[0]);
        if (numberA !== numberB) {
          return numberA - numberB;
        }
      }

      return nameA.localeCompare(nameB);
    });

    // return the presets
    return filteredAudioPresets;
  } catch (error) {
    throw new Error("Error getting audio presets.");
  }
};

export default {
  getAudioPresets,
  activatePreset,
};
