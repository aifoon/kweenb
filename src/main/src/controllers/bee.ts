/**
 * A module with all the kweenb data stuff
 */

import { IBee, IBeeInput } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import beeHelpers from "../lib/KweenB/BeeHelpers";
import Bee from "../models/Bee";
import { KweenBException } from "../lib/Exceptions/KweenBException";

/**
 * Managing the beepoller, start and stopping the interval
 * @param action start or stop the poller
 */
export const beesPoller = (
  event: any,
  action: "start" | "stop" | "pause"
): void => {
  switch (action) {
    case "start":
      KweenBGlobal.intervalWorkerList.startProcess("bee:beesPoller");
      break;
    case "stop":
      KweenBGlobal.intervalWorkerList.stopProcess("bee:beesPoller");
      break;
    case "pause":
      KweenBGlobal.intervalWorkerList.pauseProcess("bee:beesPoller");
      break;
    default:
      break;
  }
};

/**
 * Creates a new bee
 * @param event
 * @param bee
 */
export const createBee = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBeeInput
): Promise<IBee> => {
  try {
    return await beeHelpers.createBee(bee);
  } catch (e: any) {
    throw new KweenBException({ message: `createBee(): ${e.message}` });
  }
};

/**
 * Delete a bee in database
 * @param event
 * @param id
 */
export const deleteBee = (event: Electron.IpcMainInvokeEvent, id: number) => {
  try {
    Bee.destroy({ where: { id } });
  } catch (e: any) {
    throw new KweenBException({ message: `deleteBee(): ${e.message}` });
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
    return await beeHelpers.getAllBees(pollForOnline);
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
    return await beeHelpers.getBee(id);
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
