/**
 * A module with helpers used for getting bees and their config
 */

import { BeeActiveState, PDAudioParam } from "@shared/enums";
import {
  AudioScene,
  IBee,
  IBeeConfig,
  IBeeInput,
  IBeeState,
} from "@shared/interfaces";
import fs from "fs";
import Bee from "../../models/Bee";
import {
  BEE_IS_UNDEFINED,
  BEE_NOT_ONLINE,
  HIVE_DOES_NOT_CONTAIN_RECEIVE_CHANNEL,
  NO_BEE_FOUND_WITH_ID,
  ZWERM3_API_NOTRUNNING,
} from "../Exceptions/ExceptionMessages";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import TheKweenHelpers from "./TheKweenHelpers";
import { DEFAULT_BEE_CONFIG, DEFAULT_BEE_STATUS } from "../../consts";
import {
  HAS_CONNECTION_WITH_PHYSICAL_SWARM,
  PD_PORT_BEE,
} from "@shared/consts";
import { KweenBGlobal } from "../../kweenb";
import { spawn } from "child_process";
import BeeSsh from "./BeeSsh";
import { resourcesPath } from "@shared/resources";
import { PDBeeOsc } from "../OSC";
import { demoScenes } from "@seeds/demoScenes";

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

  // init the audio scenes
  const audioScenes: AudioScene[] = [];

  // get the latest status of the bee
  const currentBee = await getBee(bee.id);

  // check if the bee is online
  if (!currentBee.isOnline) return audioScenes;

  // get the audio scenes
  const beeAudioScenes = await BeeSsh.getAudioScenes(bee.ipAddress);

  // loop over the audio scenes
  for (const dataFileContent of beeAudioScenes) {
    // check if the scene already exists in audioScenes
    const foundScene = audioScenes.find(
      (scene) => scene.name === dataFileContent.name
    );

    // if the scene is not found, add it
    if (!foundScene) {
      const audioScene: AudioScene = {
        name: dataFileContent.name,
        foundOnBees: [bee],
        oscAddress: dataFileContent.oscAddress,
      };
      audioScenes.push(audioScene);
    } else {
      // if the scene is found, add the bee to the scene
      foundScene.foundOnBees.push(bee);
    }
  }

  return audioScenes;
};

/**
 * Get the audio scenes
 * @returns AudioScene[]
 */
const getAudioScenes = async (): Promise<AudioScene[]> => {
  // @note: this condition is only used for development purpose
  // whenever we are not connected to the physical swarm, we still
  // get scenes, but we get them from a demo file
  if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
    return demoScenes;
  }

  // get all bees
  const bees = await getAllBees(BeeActiveState.ACTIVE);

  // init the audio scenes
  const audioScenes: AudioScene[] = [];

  // loop over the bees
  for (const bee of bees) {
    // check if the bee is online
    if (!bee.isOnline) continue;

    // get the audio scenes
    const beeAudioScenes = await BeeSsh.getAudioScenes(bee.ipAddress);

    // loop over the audio scenes
    for (const dataFileContent of beeAudioScenes) {
      // check if the scene already exists in audioScenes
      const foundScene = audioScenes.find(
        (scene) => scene.name === dataFileContent.name
      );

      // if the scene is not found, add it
      if (!foundScene) {
        const audioScene: AudioScene = {
          name: dataFileContent.name,
          foundOnBees: [bee],
          oscAddress: dataFileContent.oscAddress,
        };
        audioScenes.push(audioScene);
      } else {
        // if the scene is found, add the bee to the scene
        foundScene.foundOnBees.push(bee);
      }
    }
  }

  // return the audio scenes
  return audioScenes;
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
          }
          resolve(iBeeState);
        });
      })
    );
  }

  return await Promise.all(beeStatesPromises);
};

/**
 * Hook this bee on the hive (if hive exists)
 * @param id
 */
const hookOnCurrentHive = async (id: number) => {
  // sets the receive channel to check
  const kweenbReceiveChannel = `kweenb:receive_${id}`;

  // check if the hive has a kweenb receive channel for this bee
  const hasKweenBReceiveChannel = await TheKweenHelpers.hasReceiveChannel(
    kweenbReceiveChannel
  );

  // throw error if there's no kweenb receive channel available
  if (!hasKweenBReceiveChannel)
    throw new Error(
      HIVE_DOES_NOT_CONTAIN_RECEIVE_CHANNEL(kweenbReceiveChannel)
    );

  // get the bee data
  const bee = await getBee(id);

  // validate if we found a Bee
  if (!bee) throw new Error(NO_BEE_FOUND_WITH_ID(id));

  // validate if the bee is online
  if (!bee.isOnline) throw new Error(BEE_NOT_ONLINE(id));

  // validate if zwerm3api is running
  if (!bee.isApiOn) throw new Error(ZWERM3_API_NOTRUNNING(bee.ipAddress));

  // kill all jack processes on bee
  await Zwerm3ApiHelpers.killJackAndJacktrip(bee.ipAddress);

  // connect to hive
  await Zwerm3ApiHelpers.startJackWithJacktripHubClient(
    bee.ipAddress,
    bee.name
  );

  // make audio connections
  await TheKweenHelpers.makeAudioConnection(
    kweenbReceiveChannel,
    `${bee.name}:send_1`
  );
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
 * Make audio connection on bee
 * @param event
 * @param bee
 */
const makeP2PAudioConnection = async (bee: IBee) => {
  // validate if we found a Bee
  if (!bee) throw new Error(BEE_IS_UNDEFINED());

  // loop over active bees and make connections
  const receiveChannel = `${bee.name}:receive_1`;
  const inputChannel = "pure_data:input_1";
  await Zwerm3ApiHelpers.connectChannel(
    bee.ipAddress,
    receiveChannel,
    inputChannel
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
      if (!bee.isOnline) continue;
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
      if (!bee.isOnline) continue;
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
      if (!bee.isOnline) continue;
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
  getBee,
  getBeeConfig,
  getCurrentBeeStates,
  hookOnCurrentHive,
  makeP2PAudioConnection,
  setAudioParam,
  setBeeActive,
  setBeePozyxTagId,
  startAudio,
  stopAudio,
};
