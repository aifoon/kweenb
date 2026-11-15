/**
 * All the KweenB controller endpoints
 */

import { app, dialog } from "electron";
import { IBee } from "@shared/interfaces";
import { PD_AUDIO_BUFFER_MS, START_PORT_JACKTRIP } from "../consts";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import kweenBHelpers from "../lib/KweenB/KweenBHelpers";
import { KweenBGlobal } from "../kweenb";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import { Utils } from "@shared/utils";
import { resourcesPath } from "@shared/resources";

/**
 * Calculate the current latency
 */
export const calculateCurrentLatency = async () => {
  try {
    const settings = await SettingHelpers.getAllSettings();
    return Utils.estimateStreamingLatency(
      settings.beeAudioSettings,
      settings.kweenBAudioSettings,
      PD_AUDIO_BUFFER_MS
    );
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
      kweenBHelpers.getJackClientName(bee)
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJackWithJacktripP2PClient()", message: e.message },
      true
    );
  }
};
