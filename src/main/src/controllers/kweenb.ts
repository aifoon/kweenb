/**
 * All the KweenB controller endpoints
 */

import { app } from "electron";
import { IBee } from "@shared/interfaces";
import { START_PORT_JACKTRIP } from "../consts";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import kweenBHelpers from "../lib/KweenB/KweenBHelpers";
import { KweenBGlobal } from "../kweenb";

/**
 * Get the KweenB Version
 * @returns
 */
export const getKweenBVersion = () => {
  try {
    return app.getVersion();
  } catch (e: any) {
    throw new KweenBException(
      { where: "getKweenBVersion()", message: e.message },
      true
    );
  }
};

/**
 * Kill all jack and jacktrip processes
 */
export const killJackAndJacktrip = async () => {
  try {
    await kweenBHelpers.killJackAndJacktrip();
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJackAndJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Disconnect all the P2P audio connections on kweenb
 */
export const disconnectAllP2PAudioConnections = async () => {
  try {
    await kweenBHelpers.disconnectAllP2PAudioConnections();
  } catch (e: any) {
    throw new KweenBException(
      { where: "disconnectAllP2PAudioConnections()", message: e.message },
      true
    );
  }
};

/**
 * Make all the P2P audio connection on kweenb
 */
export const makeP2PAudioConnections = async () => {
  try {
    await kweenBHelpers.makeP2PAudioConnections();
  } catch (e: any) {
    throw new KweenBException(
      { where: "makeP2PAudioConnections()", message: e.message },
      true
    );
  }
};

/**
 * Make the P2P audio connection on kweenb for a specific bee
 */
export const makeP2PAudioConnection = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await kweenBHelpers.makeP2PAudioConnection(bee);
  } catch (e: any) {
    throw new KweenBException(
      { where: "makeP2PAudioConnection()", message: e.message },
      true
    );
  }
};

/**
 * Start the client and connect to the kween
 * @param event
 * @param bee
 */
export const startJackWithJacktripHubClient = async () => {
  try {
    await kweenBHelpers.startJackWithJacktripHubClient();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJackWithJacktripHubClient()", message: e.message },
      true
    );
  }
};

/**
 * Start the p2p connection for a bee
 * @param event
 * @param bee
 */
export const startJackWithJacktripP2PClient = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    const localPort = START_PORT_JACKTRIP + (bee.id - 1);
    await kweenBHelpers.startJackWithJacktripP2PClient(
      bee.ipAddress,
      localPort,
      bee.name
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJackWithJacktripP2PClient()", message: e.message },
      true
    );
  }
};

/**
 * Sets the Jack folder path
 */
export const setJackFolderPath = (
  event: Electron.IpcMainInvokeEvent,
  jackFolderPath: string
) => {
  try {
    if (jackFolderPath) kweenBHelpers.setJackFolderPath(jackFolderPath);
  } catch (e: any) {
    KweenBGlobal.kweenb.throwError({
      where: "setJackFolderPath()",
      message: e.message,
    });
  }
};

/**
 * Sets the Jacktrip binary path
 */
export const setJacktripBinPath = (
  event: Electron.IpcMainInvokeEvent,
  jacktripBinPath: string
) => {
  try {
    if (jacktripBinPath) kweenBHelpers.setJacktripBinPath(jacktripBinPath);
  } catch (e: any) {
    KweenBGlobal.kweenb.throwError({
      where: "setJacktripBinPath()",
      message: e.message,
    });
  }
};
