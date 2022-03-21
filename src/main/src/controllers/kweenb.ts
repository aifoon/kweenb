/**
 * A module with all the kweenb data stuff
 */

import { IBee } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import Bee from "../models/Bee";

/**
 * Fetch all the bees
 * @returns A Promise that will result an object of format IBee
 */
export const fetchAllBees = async (): Promise<IBee[]> => {
  const bees = await Bee.findAll();
  return bees.map(({ id, name, ipAddress }) => ({
    id,
    name,
    ipAddress,
    isOnline: false,
    config: {
      jacktripVersion: "1.4.1",
      useMqtt: false,
    },
  }));
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
