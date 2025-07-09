/**
 * A module with helpers used for getting bees and their config
 */

import {
  BeeActiveState,
  BeeDeviceManagerActions,
  PDAudioParam,
} from "@shared/enums";
import {
  AudioScene,
  IBee,
  IBeeConfig,
  IBeeInput,
  IBeeState,
  SshOutputDiskSpace,
  SshOutputState,
} from "@shared/interfaces";
import fs from "fs";
import {
  BEE_IS_UNDEFINED,
  NO_BEE_FOUND_WITH_ID,
} from "../Exceptions/ExceptionMessages";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import {
  DEFAULT_BEE_CONFIG,
  DEFAULT_BEE_STATUS,
  DISK_REMAINING_ON_BEE_TRESHOLD_MB,
  SSH_PRIVATE_KEY_PATH,
} from "../../consts";
import {
  HAS_CONNECTION_WITH_PHYSICAL_SWARM,
  PD_PORT_BEE,
} from "@shared/consts";
import { KweenBGlobal } from "../../kweenb";
import { exec, spawn } from "child_process";
import BeeSsh from "./BeeSsh";
import { resourcesPath } from "@shared/resources";
import { PDBeeOsc } from "../OSC";
import { demoScenes } from "@seeds/demoScenes";
import BeeSshScriptExecutor from "./BeeSshScriptExecutor";
import { Op } from "sequelize";

// Import models
import AudioSceneDb from "../../models/AudioScene";
import Bee from "../../models/Bee";
import SettingHelpers from "./SettingHelpers";

/**
 * Creates a new bee
 * @param bee
 * @returns
 */
const createBee = async (bee: IBeeInput): Promise<IBee> => {
  const { id, ipAddress, name, isActive, channelType, channel1 } =
    await Bee.create({ ...bee });
  return {
    id,
    ipAddress,
    name,
    isActive,
    isOnline: false,
    isApiOn: false,
    status: DEFAULT_BEE_STATUS,
    networkPerformanceMs: 0,
    channelType,
    channel1,
    channel2: 0,
    pozyxTagId: "",
  };
};

/**
 * Export the bees to a json file
 */
const exportBees = async (filePath: string) => {
  // if no file is given, do not write
  if (!filePath) return;

  // get all the bees
  const bees = await getAllBees(BeeActiveState.ALL);

  // map bees to raw data
  const beeData = bees.map(
    ({
      name,
      ipAddress,
      isActive,
      id,
      channelType,
      channel1,
      channel2,
      pozyxTagId,
    }) => ({
      id,
      name,
      ipAddress,
      isActive,
      channelType,
      channel1,
      channel2,
      pozyxTagId,
    })
  );

  // write the file
  fs.writeFileSync(filePath, JSON.stringify(beeData), "utf8");
};

/**
 * Get all bees
 * @param pollForOnline boolean if we need to poll for onlineness
 * @returns
 */
const getAllBees = async (
  activeState: BeeActiveState = BeeActiveState.ACTIVE
) => {
  // get the bees
  let bees;
  switch (activeState) {
    case BeeActiveState.ALL:
      bees = await Bee.findAll();
      break;
    case BeeActiveState.ACTIVE:
      bees = await Bee.findAll({ where: { isActive: true } });
      break;
    case BeeActiveState.INACTIVE:
      bees = await Bee.findAll({ where: { isActive: false } });
      break;
    default:
      bees = await Bee.findAll();
      break;
  }

  // create an array with bees, and use connectivity list to see
  // if the bee is online
  const beesWithConfigAndStatusList: Promise<IBee>[] = bees.map(async (bee) => {
    const {
      id,
      name,
      ipAddress,
      isActive,
      channelType,
      channel1,
      channel2,
      pozyxTagId,
    } = bee;

    // check if the bee is online
    const isOnline = KweenBGlobal.kweenb.beeStates.isOnline(id);

    // return the bee, according to the IBee interface
    return {
      id,
      name,
      ipAddress,
      isActive,
      isOnline,
      isApiOn: KweenBGlobal.kweenb.beeStates.isApiOn(id),
      channelType,
      channel1,
      channel2,
      pozyxTagId,
      networkPerformanceMs:
        KweenBGlobal.kweenb.beeStates.getNetworkPerformanceMs(id),
      status: {
        isJackRunning: KweenBGlobal.kweenb.beeStates.isJackRunning(id),
        isJacktripRunning: KweenBGlobal.kweenb.beeStates.isJacktripRunning(id),
      },
    };
  });

  // await until config and statusses are received
  return Promise.all(beesWithConfigAndStatusList);
};

/**
 * Get all bees without extra status checks
 * @returns
 */
const getAllBeesData = async (
  activeState: BeeActiveState = BeeActiveState.ACTIVE
) => {
  // get the bees
  let bees;
  switch (activeState) {
    case BeeActiveState.ALL:
      bees = await Bee.findAll();
      break;
    case BeeActiveState.ACTIVE:
      bees = await Bee.findAll({ where: { isActive: true } });
      break;
    case BeeActiveState.INACTIVE:
      bees = await Bee.findAll({ where: { isActive: false } });
      break;
    default:
      bees = await Bee.findAll();
      break;
  }

  // create an array with bees, without extra status and config checks
  const beesList: IBee[] = bees.map(
    ({
      id,
      name,
      ipAddress,
      isActive,
      channelType,
      channel1,
      channel2,
      pozyxTagId,
    }) =>
      // return the bee, according to the IBee interface
      ({
        id,
        name,
        ipAddress,
        isActive,
        isOnline: false,
        isApiOn: false,
        networkPerformanceMs: 0,
        channelType,
        channel1,
        channel2,
        pozyxTagId,
        config: DEFAULT_BEE_CONFIG,
        status: DEFAULT_BEE_STATUS,
      })
  );

  // await until config and statusses are received
  return beesList;
};

/**
 * Get the audio scenes
 * @returns AudioScene[]
 */
const getAudioScenes = async (ids: number[] = []): Promise<AudioScene[]> => {
  // @note: this condition is only used for development purpose
  // whenever we are not connected to the physical swarm, we still
  // get scenes, but we get them from a demo file
  if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
    return ids.length === 0
      ? demoScenes
      : demoScenes.filter((scene) => ids.includes(scene.id));
  }

  // get all bees
  const bees = await getAllBees(BeeActiveState.ACTIVE);

  // get all audio scenes from the database, for the active bees
  const audioScenes = await getAudioScenesForBees(bees);

  // filter out the ids
  if (ids.length > 0) {
    return audioScenes.filter((scene) => ids.includes(scene.id));
  }

  return audioScenes;
};

/**
 * Get Audio Scenes for a bee
 * @param bee The bee
 * @returns AudioScene[]
 */
const getAudioScenesForBee = async (bee: IBee): Promise<AudioScene[]> => {
  // @note: this condition is only used for development purpose
  // whenever we are not connected to the physical swarm, we still
  // get scenes, but we get them from a demo file
  if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
    demoScenes.filter((scene) =>
      scene.foundOnBees.some((currentBee) => currentBee.id === bee.id)
    );
  }

  return await getAudioScenesForBees(bee);
};

/**
 * Get the audio scenes for bees
 * @returns AudioScene[]
 */
const getAudioScenesForBees = async (
  bees: IBee[] | IBee
): Promise<AudioScene[]> => {
  // @note: this condition is only used for development purpose
  // whenever we are not connected to the physical swarm, we still
  // get scenes, but we get them from a demo file
  if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
    return demoScenes;
  }

  // check if bees is an array or a single bee
  const beeArray = Array.isArray(bees) ? bees : [bees];

  // get all audio scenes from the database, for the active bees
  const audioScenesDb = await AudioSceneDb.findAll({
    where: {
      beeId: {
        [Op.in]: beeArray.map((b) => b.id),
      },
      markedForDeletion: false,
    },
  });

  // Reduce data into the desired structure
  const sceneMap: Record<string, AudioScene> = {};
  audioScenesDb.forEach((scene) => {
    const { id, name, beeId, oscAddress, localFolderPath } = scene.toJSON(); // Extract raw data

    if (!sceneMap[localFolderPath]) {
      // Initialize a new AudioScene object
      sceneMap[localFolderPath] = {
        id,
        name,
        foundOnBees: [],
        oscAddress,
        localFolderPath,
      };
    }

    // Add the beeId to foundOnBees array
    const bee = beeArray.find((b) => b.id === beeId);
    if (bee) sceneMap[localFolderPath].foundOnBees.push(bee);
  });

  // Convert the map to an array
  return Object.values(sceneMap);
};

/**
 * Get a bee based on his id
 * @param id
 * @returns
 */
const getBee = async (id: number): Promise<IBee> => {
  // get the bee
  const bee = await Bee.findOne({ where: { id } });

  // validate if we found a Bee
  if (!bee) throw new Error(NO_BEE_FOUND_WITH_ID(id));

  // return the bee, according to the IBee interface
  const beeData = {
    id: bee.id,
    ipAddress: bee.ipAddress,
    name: bee.name,
    isActive: bee.isActive,
    isApiOn: KweenBGlobal.kweenb.beeStates.isApiOn(id),
    isOnline: KweenBGlobal.kweenb.beeStates.isOnline(id),
    networkPerformanceMs:
      KweenBGlobal.kweenb.beeStates.getNetworkPerformanceMs(id),
    channelType: bee.channelType,
    channel1: bee.channel1,
    channel2: bee.channel2,
    pozyxTagId: bee.pozyxTagId,
    status: {
      isJackRunning: KweenBGlobal.kweenb.beeStates.isJackRunning(id),
      isJacktripRunning: KweenBGlobal.kweenb.beeStates.isJacktripRunning(id),
    },
  };

  // return the bee data
  return beeData;
};

/**
 * Get the bee configuration
 * @param id
 * @returns
 */
const getBeeConfig = async (id: number): Promise<IBeeConfig> => {
  // get the bee behind the id
  const bee = await Bee.findOne({ where: { id } });

  // validate
  if (!bee) throw new Error(NO_BEE_FOUND_WITH_ID(id));

  // get the bee config
  const beeConfig = await Zwerm3ApiHelpers.getAllConfig(bee.ipAddress);

  // return the configuration
  return beeConfig;
};

/**
 * Get the remaining disk space of the given bees
 * @param bees
 */
const getBeesDiskSpace = async (
  bees: IBee[]
): Promise<SshOutputDiskSpace[]> => {
  // get the location of the ssh private key
  const sshPrivateKey =
    (await SettingHelpers.getAllSettings()).kweenBSettings.sshKeyPath ||
    SSH_PRIVATE_KEY_PATH;

  return new Promise<SshOutputDiskSpace[]>((resolve, reject) => {
    exec(
      `${resourcesPath}/scripts/disk_space_monitor.sh -k ${sshPrivateKey} ${bees
        .map((b) => b.ipAddress)
        .join(" ")}`,
      (error, beeDisksSpace, stderr) => {
        const json = JSON.parse(beeDisksSpace.toString().trim()) as Omit<
          SshOutputDiskSpace,
          "hasSpaceLeft"
        >[];
        const beesDiskSpace = json.map((diskSpace) => {
          diskSpace.remainingDiskSpace = Number(diskSpace.remainingDiskSpace);
          return {
            ...diskSpace,
            hasSpaceLeft:
              diskSpace.remainingDiskSpace > DISK_REMAINING_ON_BEE_TRESHOLD_MB,
          };
        });
        resolve(beesDiskSpace);
      }
    );
  });
};

/**
 * Get the current bee states (this is the realtime data, not the cached data in BeeStatesWorker)
 * @param bees
 * @returns
 */
const getCurrentBeeStates = async (bees: IBee[]): Promise<IBeeState[]> => {
  // initiate promises
  const beeStatesPromises: Promise<IBeeState>[] = [];

  // loop through the bees
  for (const bee of bees) {
    beeStatesPromises.push(
      new Promise(async (resolve) => {
        // create a new bee state
        const iBeeState: IBeeState = {
          bee,
          lastPingResponse: null,
          isApiOn: false,
          isJackRunning: false,
          isJacktripRunning: false,
          networkPerformanceMs: 0,
          isOnline: false,
        };

        // check if the bee is online
        const child = spawn(`${resourcesPath}/scripts/is_online.sh`, [
          bee.ipAddress,
        ]);

        // listen for the response
        child.stdout.on("data", async (isOnline) => {
          if (isOnline.toString().trim() === "true") {
            iBeeState.lastPingResponse = new Date();
            iBeeState.isApiOn = await BeeSsh.isZwerm3ApiRunning(bee.ipAddress);
            iBeeState.isJackRunning = await BeeSsh.isJackRunning(bee.ipAddress);
            iBeeState.isJacktripRunning = await BeeSsh.isJacktripRunning(
              bee.ipAddress
            );
            iBeeState.isOnline = true;
          }
          resolve(iBeeState);
        });
      })
    );
  }

  return await Promise.all(beeStatesPromises);
};

/**
 * Check if the bees are online
 * @param bees
 * @returns
 */
const isOnlineMultiple = async (bees: IBee[]) => {
  // spawn a child process to check if the bees are online
  const allBeesOnline = new Promise<SshOutputState[]>((resolve, reject) => {
    exec(
      `${resourcesPath}/scripts/is_online_multiple.sh ${bees
        .map((bee) => bee.ipAddress)
        .join(" ")}`,
      (error, onlineStatus, stderr) => {
        try {
          // convert the json
          const json = JSON.parse(onlineStatus.toString().trim());

          // get the output states
          let states: SshOutputState[] = json.map((state: SshOutputState) => {
            return {
              ipAddress: state.ipAddress,
              responseTime: new Date(state.responseTime),
              isOnline: state.isOnline,
            };
          });

          // Check if all bees are online
          const allBeesOnline = states.every((state) => state.isOnline);
          if (!allBeesOnline) {
            const offlineBees = states
              .filter((state) => !state.isOnline)
              .map((state) => state.ipAddress)
              .join(", ");
            throw new Error(`Some bees are offline: ${offlineBees}`);
          }
          resolve(states);
        } catch (e: any) {
          reject(e);
        }
      }
    );
  });

  return await allBeesOnline;
};

/**
 * Import the bees in the database
 * @param filePath
 */
const importBees = async (filePath: string) => {
  // if no files
  if (!filePath) return;

  // get the data from file
  const data = fs.readFileSync(filePath);

  // convert to json
  const beeData = JSON.parse(data.toString());

  // validate the data
  if (!Array.isArray(beeData) || beeData.length === 0) return;

  // create a helper function
  const equals = (a: string[], b: string[]) =>
    JSON.stringify(a) === JSON.stringify(b);

  // create the expected array result
  const expectedObjectKeys = [
    "id",
    "name",
    "ipAddress",
    "isActive",
    "channelType",
    "channel1",
    "channel2",
    "pozyxTagId",
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const bee of beeData) {
    const objectKeys = Object.keys(bee);
    if (!equals(objectKeys, expectedObjectKeys)) return;
  }

  // delete all data and replace with the file's data
  await Bee.destroy({ where: {} });

  // clear the bee states
  KweenBGlobal.kweenb.beeStatesWorker.beeStates.clear();

  // loop over bees and create the bee
  beeData.forEach(async (bee) => Bee.create(bee));

  // init the bee states worker
  KweenBGlobal.kweenb.beeStatesWorker.init();
};

/**
 * Manage the bee device
 * @param bee - Single bee or array of bees to manage
 * @param action - Action to perform on the bee device
 */
const manageBeeDevice = async (
  bees: IBee[] | IBee,
  action: BeeDeviceManagerActions
): Promise<void> => {
  // Convert input to array and handle empty/null cases
  let internalBees: IBee[] = Array.isArray(bees) ? bees : bees ? [bees] : [];

  // If no bees provided, get all active and online bees
  if (internalBees.length === 0) {
    internalBees = (await getAllBees(BeeActiveState.ALL)).filter(
      (b) => b.isOnline
    );
  }

  // Validate we have bees to manage
  if (internalBees.length === 0) {
    console.error("No bees found to manage.");
    return;
  }

  try {
    // Execute the script
    await new BeeSshScriptExecutor().executeWithNoOutput(
      "device_manager.sh",
      internalBees,
      [{ flag: "-t", value: action.toString() }]
    );
  } catch (error) {
    console.log("error!!!");
  }
};

/**
 * Make audio connection on bee
 * @param event
 * @param bee
 */
const makeAudioConnection = async (bees: IBee[] | IBee): Promise<void> => {
  // validate
  if (!bees) throw new Error(BEE_IS_UNDEFINED());

  // check if bees is an array or a single bee
  const beeArray = Array.isArray(bees) ? bees : [bees];

  // execute the script
  await new BeeSshScriptExecutor().executeWithNoOutput(
    "create_jack_connection_on_bee.sh",
    beeArray
  );
};

/**
 * Sets the bee active or inactive
 * @param id The ID of the bee
 * @param active The active/inactive state
 */
const setBeeActive = async (id: number, active: boolean) => {
  // get the bee
  const bee = await Bee.findOne({ where: { id } });

  // validate if we found a Bee
  if (!bee) throw new Error(NO_BEE_FOUND_WITH_ID(id));

  // validate
  if (bee.isActive === active)
    throw new Error(`Bee is already ${active ? "active" : "inactive"}.`);

  // set the state and save
  await Bee.update({ isActive: active }, { where: { id } });
};

/**
 * Sets the pozyx tag id for a bee
 * @param bee The bee
 * @param pozyxTagId The pozyx tag id
 */
const setBeePozyxTagId = async (bee: IBee, pozyxTagId: string) => {
  // get the bee
  const requestedBee = await Bee.findOne({ where: { id: bee.id } });

  // validate if we found a Bee
  if (!requestedBee) throw new Error(NO_BEE_FOUND_WITH_ID(bee.id));

  // validate
  if (!bee.isActive) throw new Error(`Bee is not active.`);

  // set the state and save
  requestedBee.pozyxTagId = pozyxTagId;
  await requestedBee.save();
};

/**
 * Set an audio param on a bee
 * @param bees
 * @param volume
 */
const setAudioParam = async (
  bees: IBee[] | IBee,
  pdAudioParam: PDAudioParam,
  value: number | boolean
) => {
  try {
    // check if bees is an array or a single bee
    const beeArray = Array.isArray(bees) ? bees : [bees];

    // iterate over the beeArray
    for (const bee of beeArray) {
      if (!KweenBGlobal.kweenb.beeStates.isOnline(bee.id)) continue;
      const pdBeeOsc = new PDBeeOsc(bee.ipAddress, PD_PORT_BEE);
      switch (pdAudioParam) {
        case PDAudioParam.VOLUME:
          pdBeeOsc.setVolume(Number(value));
          break;
        case PDAudioParam.LOW:
          pdBeeOsc.setBass(Number(value));
          break;
        case PDAudioParam.MID:
          pdBeeOsc.setMid(Number(value));
          break;
        case PDAudioParam.HIGH:
          pdBeeOsc.setHigh(Number(value));
          break;
        case PDAudioParam.FILE_LOOP:
          pdBeeOsc.setFileLoop(Boolean(value));
          break;
        case PDAudioParam.USE_EQ:
          pdBeeOsc.setUseEq(Boolean(value));
          break;
        default:
          throw new Error("Invalid PDAudioParam");
      }
    }
  } catch (e: any) {
    throw new Error("Sending volume to bee failed: " + e.message);
  }
};

/**
 * Start audio on a bee
 * @param bees The bee(s)
 * @param value The value to start audio with
 */
const startAudio = async (bees: IBee[] | IBee, value: string) => {
  try {
    // check if bees is an array or a single bee
    const beeArray = Array.isArray(bees) ? bees : [bees];

    // iterate over the beeArray
    for (const bee of beeArray) {
      // check the current online state (the one in the object could be outdated)
      if (!KweenBGlobal.kweenb.beeStates.isOnline(bee.id)) continue;
      const pdBeeOsc = new PDBeeOsc(bee.ipAddress, PD_PORT_BEE);
      await pdBeeOsc.startAudio(value);
    }
  } catch (e: any) {
    throw new Error("Starting audio failed: " + e.message);
  }
};

/**
 * Stop audio on a bee
 * @param bees The bee(s)
 * @param value The value to start audio with
 */
const stopAudio = async (bees: IBee[] | IBee) => {
  try {
    // check if bees is an array or a single bee
    const beeArray = Array.isArray(bees) ? bees : [bees];

    // iterate over the beeArray
    for (const bee of beeArray) {
      if (!KweenBGlobal.kweenb.beeStates.isOnline(bee.id)) continue;
      const pdBeeOsc = new PDBeeOsc(bee.ipAddress, PD_PORT_BEE);
      await pdBeeOsc.stopAudio();
    }
  } catch (e: any) {
    throw new Error("Stopping audio failed: " + e.message);
  }
};

export default {
  createBee,
  exportBees,
  importBees,
  getAllBees,
  getAllBeesData,
  getAudioScenes,
  getAudioScenesForBee,
  getAudioScenesForBees,
  getBee,
  getBeeConfig,
  getBeesDiskSpace,
  getCurrentBeeStates,
  isOnlineMultiple,
  manageBeeDevice,
  makeAudioConnection,
  setAudioParam,
  setBeeActive,
  setBeePozyxTagId,
  startAudio,
  stopAudio,
};
