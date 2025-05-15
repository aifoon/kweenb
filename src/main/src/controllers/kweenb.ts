/**
 * All the KweenB controller endpoints
 */

import { app, dialog } from "electron";
import { IBee } from "@shared/interfaces";
import { START_PORT_JACKTRIP } from "../consts";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import kweenBHelpers from "../lib/KweenB/KweenBHelpers";
import { KweenBGlobal } from "../kweenb";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import { Utils } from "@shared/utils";
import { resourcesPath } from "@shared/resources";
import { HubStreaming } from "../lib/Streaming";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import { BeeActiveState } from "@shared/enums";

/**
 * Calculate the current latency
 */
export const calculateCurrentLatency = async () => {
  try {
    const settings = await SettingHelpers.getAllSettings();
    const latencyBee = Utils.calculateLatency(
      settings.beeAudioSettings.jack.sampleRate,
      settings.beeAudioSettings.jack.bufferSize,
      settings.beeAudioSettings.jack.periods
    );
    const latencyKweenb = Utils.calculateLatency(
      settings.kweenBAudioSettings.jack.sampleRate,
      settings.kweenBAudioSettings.jack.bufferSize,
      settings.kweenBAudioSettings.jack.periods
    );
    return Utils.roundToDecimals(latencyBee + latencyKweenb, 2);
  } catch (e: any) {
    throw new KweenBException(
      { where: "calculateCurrentLatency()", message: e.message },
      true
    );
  }
};

/**
 * Close the application
 * @param event Electron.IpcMainInvokeEvent
 * @param method Method to call
 * @param params Params to pass
 */
export const closeKweenB = async () => {
  try {
    app.quit();
  } catch (e: any) {
    throw new KweenBException(
      { where: "closeKweenB()", message: e.message },
      false
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
 * Is Jack and Jacktrip installed on the system
 */
export const isJackAndJacktripInstalled = (): boolean => {
  try {
    return kweenBHelpers.isJackAndJacktripInstalled();
  } catch (e: any) {
    throw new KweenBException(
      { where: "isJackAndJacktripInstalled()", message: e.message },
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
 * Make all the hub audio connection on kweenb and hub
 */
export const makeHubAudioConnections = async () => {
  try {
    await kweenBHelpers.makeHubAudioConnections();
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
 * Open a dialog
 * @param event Electron.IpcMainInvokeEvent
 * @param method Method to call
 * @param params Params to pass
 */
export const openDialog = async (
  event: Electron.IpcMainInvokeEvent,
  method: keyof Electron.Dialog,
  params: Electron.OpenDialogOptions
): Promise<string[]> => {
  try {
    if (typeof dialog[method] === "function") {
      return (await (dialog[method] as Function).call(
        dialog,
        params
      )) as string[];
    } else return [];
  } catch (e: any) {
    throw new KweenBException(
      { where: "openDialog()", message: e.message },
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
    kweenBHelpers.setJacktripBinPath(
      jacktripBinPath ||
        `${resourcesPath}/jacktrip/JackTrip.app/Contents/MacOs/jacktrip`
    );
  } catch (e: any) {
    KweenBGlobal.kweenb.throwError({
      where: "setJacktripBinPath()",
      message: e.message,
    });
  }
};

/**
 * Start the jacktrip hub server
 * @param event
 * @param bee
 */
export const startJacktripHubServer = async () => {
  try {
    await kweenBHelpers.startJacktripHubServer();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJacktripHubServer()", message: e.message },
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
    // Get the cluster size from the settings
    const hubModeClusterSize = (await SettingHelpers.getAllSettings())
      .kweenBSettings.hubModeClusterSize;

    // Get the active bees (data only is enough for this case)
    const activeBees = await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);

    // Start Jack
    await kweenBHelpers.startJack();

    // Distribute the bees into clusters
    const distributedBeesIntoClusters = HubStreaming.distributeBeesIntoClusters(
      activeBees,
      hubModeClusterSize
    );

    // Start Jacktrip client
    const startJacktripHubClientOnKweenBPromises =
      distributedBeesIntoClusters.map((cluster, i) => {
        kweenBHelpers.startJacktripHubClient(i, cluster.length);
      });
    await Promise.all(startJacktripHubClientOnKweenBPromises);
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
