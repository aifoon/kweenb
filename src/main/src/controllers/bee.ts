/**
 * A module with all the kweenb data stuff
 */

import { IBee, IBeeConfig, IBeeInput } from "@shared/interfaces";
import { Utils } from "@shared/utils";
import { BeeActiveState } from "@shared/enums";
import { KweenBGlobal } from "../kweenb";
import beeHelpers from "../lib/KweenB/BeeHelpers";
import zwerm3ApiHelpers from "../lib/KweenB/Zwerm3ApiHelpers";
import Bee from "../models/Bee";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import BeeHelpers from "../lib/KweenB/BeeHelpers";

/**
 * Managing the beepoller, start and stopping the interval
 * @param event The invoke event
 * @param action start or stop the poller
 */
export const beesPoller = (
  event: Electron.IpcMainInvokeEvent,
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
 * Managing the beepoller, start and stopping the interval
 * @param event The invoke event
 * @param action The action we need to do, starting, stopping or pausing
 * @param params The params given (in this case [1], first item of tuple is the bee id)
 */
export const beePoller = (
  event: Electron.IpcMainInvokeEvent,
  action: "start" | "stop" | "pause",
  params: any[] = []
) => {
  switch (action) {
    case "start":
      KweenBGlobal.intervalWorkerList.startProcess("bee:beePoller", params);
      break;
    case "stop":
      KweenBGlobal.intervalWorkerList.stopProcess("bee:beePoller");
      break;
    case "pause":
      KweenBGlobal.intervalWorkerList.pauseProcess("bee:beePoller");
      break;
    default:
      break;
  }
};

/**
 * Create a new bee
 * @param event The invoke event
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
 * Hook this bee on the hive (if hive exists)
 * @param event
 * @param bee
 */
export const hookOnCurrentHive = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeHelpers.hookOnCurrentHive(bee.id);
  } catch (e: any) {
    throw new KweenBException(
      { where: "hookOnCurrentHive()", message: e.message },
      true
    );
  }
};

/**
 * Kill Jack And Jacktrip processes on the client
 * @param event
 * @param bee
 */
export const killJackAndJacktrip = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.killJackAndJacktrip(bee.ipAddress);
    // KweenBGlobal.kweenb.showSuccess("Killed Jack and Jacktrip processes.");
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJackAndJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Kill Jack processes on the client
 * @param event
 * @param bee
 */
export const killJack = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.killJack(bee.ipAddress);
    // KweenBGlobal.kweenb.showSuccess("Killed Jack processes.");
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJack()", message: e.message },
      true
    );
  }
};

/**
 * Kill Jacktrip processes on the client
 * @param event
 * @param bee
 */
export const killJacktrip = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.killJacktrip(bee.ipAddress);
    // KweenBGlobal.kweenb.showSuccess("Killed Jacktrip processes.");
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Fetch the active bees
 * @param event
 * @returns
 */
export const fetchActiveBees = async () => {
  try {
    return await beeHelpers.getAllBees(true, BeeActiveState.ACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchActiveBees()",
      message: e.message,
    });
  }
};

/**
 * Fetch the active bees without status checks
 * @param event
 * @returns
 */
export const fetchActiveBeesData = async () => {
  try {
    return await beeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchActiveBeesData()",
      message: e.message,
    });
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
    return await beeHelpers.getAllBees(pollForOnline, BeeActiveState.ALL);
  } catch (e: any) {
    throw new KweenBException({ where: "fetchAllBees()", message: e.message });
  }
};

/**
 * Fetch all the bees without extra status checks
 */
export const fetchAllBeesData = async (): Promise<IBee[]> => {
  try {
    return await beeHelpers.getAllBeesData(BeeActiveState.ALL);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchAllBeesData()",
      message: e.message,
    });
  }
};

/**
 * Fetch the inactive bees
 * @param event
 * @returns
 */
export const fetchInActiveBees = async () => {
  try {
    return await beeHelpers.getAllBees(false, BeeActiveState.INACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchInActiveBees()",
      message: e.message,
    });
  }
};

/**
 * Fetch the inactive bees without extra status checks
 * @param event
 * @returns
 */
export const fetchInActiveBeesData = async () => {
  try {
    return await beeHelpers.getAllBeesData(BeeActiveState.INACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchInActiveBeesData()",
      message: e.message,
    });
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
    const bee = await beeHelpers.getBee(id);
    return bee;
  } catch (e: any) {
    throw new KweenBException(
      { where: "fetchBee()", message: e.message },
      true
    );
  }
};

/**
 * Sets the bee active
 * @param event The invoke event
 * @param id The ID of the bee
 * @param active The active state of the bee
 * @returns
 */
export const setBeeActive = async (
  event: Electron.IpcMainInvokeEvent,
  id: number,
  active: boolean
) => {
  try {
    await beeHelpers.setBeeActive(id, active);
  } catch (e: any) {
    throw new KweenBException(
      { where: "setBeeActive()", message: e.message },
      true
    );
  }
};

/**
 * Start Jack on a specific bee
 * @param event The Invoke event
 * @param bee
 */
export const startJack = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.startJack(bee.ipAddress);
    // KweenBGlobal.kweenb.showSuccess("Started Jack with success.");
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJack()", message: e.message },
      true
    );
  }
};

/**
 * Start the client and connect to the kween
 * @param event
 * @param bee
 */
export const startJackWithJacktripClient = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.startJackWithJacktripClient(bee.ipAddress, bee.name);
  } catch (e: any) {
    throw new KweenBException(
      { where: "startClient()", message: e.message },
      true
    );
  }
};

/**
 * Saves in the internal configuration
 * @param event
 * @param bee
 */
export const saveConfig = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee,
  config: Partial<IBeeConfig>
) => {
  try {
    if (!bee.id) throw new Error("Please provide an id for the requested Bee.");
    await zwerm3ApiHelpers.saveConfig(bee.ipAddress, config);
  } catch (e: any) {
    throw new KweenBException(
      { where: "saveConfig()", message: e.message },
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
