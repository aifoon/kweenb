/**
 * A module with all the kweenb data stuff
 */

import ping from "ping";
import { IBee } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import { getBeeConfig, getBeeStatus } from "../lib/KweenB/BeeHelpers";
import Bee from "../models/Bee";

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
      // console.log(isOnline);
      // return the bee, according to the IBee interface
      return {
        id,
        name,
        ipAddress,
        isOnline,
        config: isOnline ? await getBeeConfig(id) : null,
        status: isOnline ? await getBeeStatus(id) : null,
      };
    }
  );

  // await until config and statusses are received
  return Promise.all(beesWithConfigAndStatusList);
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
