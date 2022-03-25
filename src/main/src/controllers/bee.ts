/**
 * A module with all the kweenb data stuff
 */

import { IBee, IBeeInput } from "@shared/interfaces";
import { Utils } from "@shared/utils";
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
    // validate bee number
    const beeNumberExists = await Bee.findOne({ where: { id: bee.id } });
    if (beeNumberExists)
      throw new Error(
        `A bee with the number ${Utils.addLeadingZero(bee.id)} already exists.`
      );

    // validate bee ip address
    const beeIpAddressExists = await Bee.findOne({
      where: { ipAddress: bee.ipAddress },
    });
    if (beeIpAddressExists)
      throw new Error(
        `A bee with the ip address ${bee.ipAddress} already exists.`
      );

    // create a new bee
    const createdBee = await beeHelpers.createBee(bee);

    // show confirmation when bee was added
    KweenBGlobal.kweenb.showSuccess(
      `Bee ${Utils.addLeadingZero(createdBee.id)} was created successfully.`
    );

    // return the created bee
    return createdBee;
  } catch (e: any) {
    throw new KweenBException(
      { where: "createBee()", message: e.message },
      true
    );
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
    KweenBGlobal.kweenb.showInfo(
      `Bee ${Utils.addLeadingZero(id)} was deleted successfully.`
    );
  } catch (e: any) {
    throw new KweenBException({ where: "deleteBee()", message: e.message });
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
    throw new KweenBException({ where: "updateBee()", message: e.message });
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
    throw new KweenBException(
      { where: "fetchBee()", message: e.message },
      true
    );
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
    throw new KweenBException(
      { where: "updateBee()", message: e.message },
      true
    );
  }
};
