/**
 * A module with helpers used for getting bees and their config
 */

import { BeeActiveState } from "@shared/enums";
import { IBee, IBeeConfig, IBeeInput, IBeeStatus } from "@shared/interfaces";
import ping from "ping";
import Bee from "../../models/Bee";

/**
 * Define the defaults
 */

const defaultBeeConfig = {
  jacktripVersion: "1.4.1",
  useMqtt: false,
};

const defaultBeeStatus = {
  isJackRunning: false,
  isJacktripRunning: false,
};

const pingConfig: ping.PingConfig = {
  timeout: 1,
  deadline: 1,
};

/**
 * Get the bee configuration
 * @param id
 * @returns
 */
const getBeeConfig = async (id: number): Promise<IBeeConfig> => {
  // get the bee behind the id
  await Bee.findOne({ where: { id } });

  // @TODO get the configuration from a bee
  const beeConfig = {
    jacktripVersion: "1.4.1",
    useMqtt: false,
  };

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

  // @TODO get the configuration from a bee
  const beeStatus = {
    isJackRunning: true,
    isJacktripRunning: true,
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
    config: defaultBeeConfig,
    status: defaultBeeStatus,
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
      ping.promise.probe(ipAddress, pingConfig)
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

      // return the bee, according to the IBee interface
      return {
        id,
        name,
        ipAddress,
        isActive,
        isOnline,
        config: isOnline ? await getBeeConfig(id) : defaultBeeConfig,
        status: isOnline ? await getBeeStatus(id) : defaultBeeStatus,
      };
    }
  );

  // await until config and statusses are received
  return Promise.all(beesWithConfigAndStatusList);
};

/**
 * Get a bee based on his id
 * @param id
 * @returns
 */
const getBee = async (id: number) => {
  // get the bee
  const bee = await Bee.findOne({ where: { id } });

  // validate if we found a Bee
  if (!bee) throw new Error(`No bee found with the id ${id}.`);

  // get all the ip addresses of our bees and map the ping promises
  const beeConnectivity = await ping.promise.probe(bee.ipAddress, pingConfig);

  // check if the bee is online
  const isOnline = beeConnectivity.alive;

  // return the bee, according to the IBee interface
  return {
    id: bee.id,
    ipAddress: bee.ipAddress,
    name: bee.name,
    isActive: bee.isActive,
    isOnline,
    config: isOnline ? await getBeeConfig(id) : defaultBeeConfig,
    status: isOnline ? await getBeeStatus(id) : defaultBeeStatus,
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
  if (!bee) throw new Error(`No bee found with the id ${id}.`);

  // validate
  if (bee.isActive === active)
    throw new Error(`Bee is already ${active ? "active" : "inactive"}.`);

  // set the state and save
  await Bee.update({ isActive: active }, { where: { id } });
};

export default {
  getBeeStatus,
  getBeeConfig,
  createBee,
  getAllBees,
  getBee,
  setBeeActive,
};
