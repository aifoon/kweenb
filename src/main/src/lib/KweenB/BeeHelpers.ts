/**
 * A module with helpers used for getting bees and their config
 */

import { BeeActiveState } from "@shared/enums";
import { IBee, IBeeConfig, IBeeInput, IBeeStatus } from "@shared/interfaces";
import ping from "ping";
import Bee from "../../models/Bee";
import { NO_BEE_FOUND_WITH_ID } from "../Exceptions/ExceptionMessages";
import zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import {
  DEFAULT_BEE_CONFIG,
  DEFAULT_BEE_STATUS,
  PING_CONFIG,
} from "../../consts";

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
  const beeConfig = await zwerm3ApiHelpers.getAllConfig(bee.ipAddress);

  // return the configuration
  return beeConfig;
};

/**
 * Get the bee status
 * @param id
 * @returns
 */
const getBeeStatus = async (id: number): Promise<IBeeStatus> => {
  // get the bee behind the id
  const bee = await Bee.findOne({ where: { id } });

  // validate
  if (!bee) throw new Error(NO_BEE_FOUND_WITH_ID(id));

  // get the statuses
  const beeStatus = {
    isJackRunning: await zwerm3ApiHelpers.isJackRunning(bee.ipAddress),
    isJacktripRunning: await zwerm3ApiHelpers.isJacktripRunning(bee.ipAddress),
  };

  // return the configuration
  return beeStatus;
};

/**
 * Creates a new bee
 * @param bee
 * @returns
 */
const createBee = async (bee: IBeeInput): Promise<IBee> => {
  const { id, ipAddress, name, isActive } = await Bee.create({ ...bee });
  return {
    id,
    ipAddress,
    name,
    isActive,
    isOnline: false,
    isApiOn: false,
    config: DEFAULT_BEE_CONFIG,
    status: DEFAULT_BEE_STATUS,
  };
};

/**
 * Get all bees
 * @param pollForOnline boolean if we need to poll for onlineness
 * @returns
 */
const getAllBees = async (
  pollForOnline: boolean = false,
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

  // init the connectivity list
  let connectivityList: ping.PingResponse[] = [];

  // if we need to poll for online behavior
  if (pollForOnline) {
    // get all the ip addresses of our bees and map the ping promises
    const beeIpAddresses = bees.map(({ ipAddress }) =>
      ping.promise.probe(ipAddress, PING_CONFIG)
    );

    // check connectivity, by ping to device
    // wait untill all addresses are pinged
    connectivityList = await Promise.all(beeIpAddresses);
  }

  // create an array with bees, and use connectivity list to see
  // if the bee is online
  const beesWithConfigAndStatusList: Promise<IBee>[] = bees.map(
    async ({ id, name, ipAddress, isActive }) => {
      // set offline by default
      let isOnline = false;

      // if we are polling for online, check the status
      if (pollForOnline) {
        // find the host in our bee list
        const beeHost = connectivityList.find(
          ({ inputHost }) => inputHost === ipAddress
        );

        // check if the bee is online
        isOnline = beeHost ? beeHost.alive : false;
      }

      // check if API is on
      const isApiOn = isOnline
        ? await zwerm3ApiHelpers.isZwerm3ApiRunning(ipAddress)
        : false;

      // return the bee, according to the IBee interface
      return {
        id,
        name,
        ipAddress,
        isActive,
        isOnline,
        isApiOn,
        config: isOnline ? await getBeeConfig(id) : DEFAULT_BEE_CONFIG,
        status: isOnline ? await getBeeStatus(id) : DEFAULT_BEE_STATUS,
      };
    }
  );

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
  const beesList: IBee[] = bees.map(({ id, name, ipAddress, isActive }) =>
    // return the bee, according to the IBee interface
    ({
      id,
      name,
      ipAddress,
      isActive,
      isOnline: false,
      isApiOn: false,
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

  // get all the ip addresses of our bees and map the ping promises
  const beeConnectivity = await ping.promise.probe(bee.ipAddress, PING_CONFIG);

  // check if the bee is online
  const isOnline = beeConnectivity.alive;

  // check if the api is on
  const isApiOn = await zwerm3ApiHelpers.isZwerm3ApiRunning(bee.ipAddress);

  // return the bee, according to the IBee interface
  return {
    id: bee.id,
    ipAddress: bee.ipAddress,
    name: bee.name,
    isActive: bee.isActive,
    isApiOn,
    isOnline,
    config: isOnline ? await getBeeConfig(id) : DEFAULT_BEE_CONFIG,
    status: isOnline ? await getBeeStatus(id) : DEFAULT_BEE_STATUS,
  };
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

export default {
  createBee,
  getAllBees,
  getAllBeesData,
  getBee,
  getBeeConfig,
  getBeeStatus,
  setBeeActive,
};
