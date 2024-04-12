/**
 * A module with helpers used for getting bees and their config
 */

import { BeeActiveState } from "@shared/enums";
import { IBee, IBeeConfig, IBeeInput, IBeeState } from "@shared/interfaces";
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
import { KweenBGlobal } from "../../kweenb";
import { spawn } from "child_process";
import BeeSsh from "./BeeSsh";
import { resourcesPath } from "@shared/resources";

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
 * Make audio connection on bee
 * @param event
 * @param bee
 */
const makeP2PAudioConnection = async (bee: IBee) => {
  // validate if we found a Bee
  if (!bee) throw new Error(BEE_IS_UNDEFINED());

  // loop over active bees and make connections
  const playbackChannel1 = `system:playback_1`;
  const playbackChannel2 = `system:playback_2`;
  const receiveChannel = `${bee.name}:receive_1`;
  await Zwerm3ApiHelpers.connectChannel(
    bee.ipAddress,
    receiveChannel,
    playbackChannel1
  );
  await Zwerm3ApiHelpers.connectChannel(
    bee.ipAddress,
    receiveChannel,
    playbackChannel2
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

export default {
  createBee,
  exportBees,
  importBees,
  getAllBees,
  getAllBeesData,
  getBee,
  getBeeConfig,
  getCurrentBeeStates,
  hookOnCurrentHive,
  makeP2PAudioConnection,
  setBeeActive,
  setBeePozyxTagId,
};
