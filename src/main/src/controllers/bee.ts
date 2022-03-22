/**
 * A module with all the kweenb data stuff
 */

import ping from "ping";
import { IBee } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import { getBeeConfig, getBeeStatus } from "../lib/KweenB/BeeHelpers";
import Bee from "../models/Bee";
import { KweenBException } from "../lib/Exceptions/KweenBException";

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
 * Fetch all the bees
 * @returns A Promise that will result an object of format IBee
 */
export const fetchAllBees = async (): Promise<IBee[]> => {
  // get the bees
  const bees = await Bee.findAll();

  // get all the ip addresses of our bees and map the ping promises
  const beeIpAddresses = bees.map(({ ipAddress }) =>
    ping.promise.probe(ipAddress, {
      min_reply: 1,
    })
  );

  // check connectivity, by ping to device
  // wait untill all addresses are pinged
  const connectivityList = await Promise.all(beeIpAddresses);

  // create an array with bees, and use connectivity list to see
  // if the bee is online
  const beesWithConfigAndStatusList: Promise<IBee>[] = bees.map(
    async ({ id, name, ipAddress }) => {
      // find the host in our bee list
      const beeHost = connectivityList.find(
        ({ inputHost }) => inputHost === ipAddress
      );

      // check if the bee is online
      const isOnline = beeHost ? beeHost.alive : false;

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
 * Fetching a bee based on the ID
 * @param id The id of the bee to be found
 * @returns an object shaped like an IBee
 */
export const fetchBee = async (
  event: Electron.IpcMainInvokeEvent,
  id: number
): Promise<IBee> => {
  try {
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
  } catch (e: any) {
    throw new KweenBException({ message: `fetchBee(): ${e.message}` }, true);
  }
};

/**
 * Update a Bee
 * @param event
 * @param bee
 */
export const updateBee = async (
  event: Electron.IpcMainInvokeEvent,
  bee: Partial<IBee>
) => {
  try {
    if (!bee.id) throw new Error("Please provide an id for the requested Bee.");
    Bee.update(bee, { where: { id: bee.id } });
  } catch (e: any) {
    throw new KweenBException({ message: `updateBee(): ${e.message}` });
  }
};

/**
 * Managing the beepoller, start and stopping the interval
 * @param action start or stop the poller
 */
export const beesPoller = (event: any, action: "start" | "stop"): void => {
  switch (action) {
    case "start":
      KweenBGlobal.intervalWorkerList.startProcess("beesPoller");
      break;
    case "stop":
      KweenBGlobal.intervalWorkerList.stopProcess("beesPoller");
      break;
    default:
  }
};
