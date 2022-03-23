/**
 * A module with helpers used for getting bees and their config
 */

import { IBee, IBeeConfig, IBeeStatus } from "@shared/interfaces";
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

/**
 * Get the bee configuration
 * @param id
 * @returns
 */
export const getBeeConfig = async (id: number): Promise<IBeeConfig> => {
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
export const getBeeStatus = async (id: number): Promise<IBeeStatus> => {
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
 * Get all bees
 * @param pollForOnline boolean if we need to poll for onlineness
 * @returns
 */
export const getAllBees = async (pollForOnline: boolean = false) => {
  // get the bees
  const bees = await Bee.findAll();
  let connectivityList: ping.PingResponse[] = [];

  // if we need to poll for online behavior
  if (pollForOnline) {
    // get all the ip addresses of our bees and map the ping promises
    const beeIpAddresses = bees.map(({ ipAddress }) =>
      ping.promise.probe(ipAddress, {
        min_reply: 1,
      })
    );

    // check connectivity, by ping to device
    // wait untill all addresses are pinged
    connectivityList = await Promise.all(beeIpAddresses);
  }

  // create an array with bees, and use connectivity list to see
  // if the bee is online
  const beesWithConfigAndStatusList: Promise<IBee>[] = bees.map(
    async ({ id, name, ipAddress }) => {
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
export const getBee = async (id: number) => {
  // get the bee
  const bee = await Bee.findOne({ where: { id } });

  // validate if we found a Bee
  if (!bee) throw new Error(`No bee found with the id ${id}.`);

  // get all the ip addresses of our bees and map the ping promises
  const beeConnectivity = await ping.promise.probe(bee.ipAddress, {
    min_reply: 1,
  });

  // check if the bee is online
  const isOnline = beeConnectivity.alive;

  // return the bee, according to the IBee interface
  return {
    id: bee.id,
    ipAddress: bee.ipAddress,
    name: bee.name,
    isOnline,
    config: isOnline ? await getBeeConfig(id) : defaultBeeConfig,
    status: isOnline ? await getBeeStatus(id) : defaultBeeStatus,
  };
};
