/**
 * A module with all the kweenb data stuff
 */

import ping from "ping";
import { IBee } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import {
  getAllBees,
  getBee,
  getBeeConfig,
  getBeeStatus,
} from "../lib/KweenB/BeeHelpers";
import Bee from "../models/Bee";
import { KweenBException } from "../lib/Exceptions/KweenBException";

/**
 * Managing the beepoller, start and stopping the interval
 * @param action start or stop the poller
 */
export const beesPoller = (event: any, action: "start" | "stop"): void => {
  switch (action) {
    case "start":
      KweenBGlobal.intervalWorkerList.startProcess("bee:beesPoller");
      break;
    case "stop":
      KweenBGlobal.intervalWorkerList.stopProcess("bee:beesPoller");
      break;
    default:
  }
};

/**
 * Creates a new bee
 * @param event
 * @param bee
 */
export const createBee = (
  event: any,
  bee: Pick<IBee, "name" | "ipAddress">
) => {
  try {
    Bee.create(bee);
  } catch (e: any) {
    throw new KweenBException({ message: `createBee(): ${e.message}` });
  }
};

/**
 * Fetch all the bees
 * @returns A Promise that will result an object of format IBee
 */
export const fetchAllBees = async (
  event: Electron.IpcMainInvokeEvent,
  pollForOnline: boolean = true
): Promise<IBee[]> => {
  try {
    return await getAllBees(pollForOnline);
  } catch (e: any) {
    throw new KweenBException({ message: `updateBee(): ${e.message}` });
  }
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
    return await getBee(id);
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
