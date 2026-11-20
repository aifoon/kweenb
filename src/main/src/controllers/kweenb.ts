/**
 * All the KweenB controller endpoints
 */

import os from "os";
import QRCode from "qrcode";
import { app, dialog, shell } from "electron";
import { IBee, IRemoteInterface } from "@shared/interfaces";
import {
  PD_AUDIO_BUFFER_MS,
  REMOTE_INTERFACE_PORT,
  START_PORT_JACKTRIP,
} from "../consts";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import kweenBHelpers from "../lib/KweenB/KweenBHelpers";
import { KweenBGlobal } from "../kweenb";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import { Utils } from "@shared/utils";
import { jackFolderFor, jacktripBinFor } from "../lib/KweenB/BundledJack";

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
    const folder = jackFolderFor(jackFolderPath);
    if (folder) kweenBHelpers.setJackFolderPath(folder);
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
    const bin = jacktripBinFor(jacktripBinPath);
    if (bin) kweenBHelpers.setJacktripBinPath(bin);
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

/**
 * The address of this computer that a phone on the network of the swarm
 * can reach: the one in the same network as the bees, else the first one
 */
const networkAddressOfThisComputer = async (): Promise<string | null> => {
  const addresses = Object.values(os.networkInterfaces())
    .flat()
    .filter(
      (address): address is os.NetworkInterfaceInfo =>
        !!address && address.family === "IPv4" && !address.internal
    )
    .map((address) => address.address);
  if (addresses.length === 0) return null;

  try {
    const networkOf = (address: string) =>
      address.split(".").slice(0, 3).join(".");
    const beeNetworks = (await BeeHelpers.getAllBees()).map((bee) =>
      networkOf(bee.ipAddress)
    );
    const withTheBees = addresses.find((address) =>
      beeNetworks.includes(networkOf(address))
    );
    if (withTheBees) return withTheBees;
  } catch (e) {
    // without the bees the first address is used
  }
  return addresses[0];
};

/**
 * Where the remote interface can be opened, with a QR code for a phone
 */
export const getRemoteInterface = async (): Promise<IRemoteInterface> => {
  const localUrl = `http://localhost:${REMOTE_INTERFACE_PORT}`;
  const address = await networkAddressOfThisComputer();
  if (!address) return { localUrl, networkUrl: null, qrCode: null };

  const networkUrl = `http://${address}:${REMOTE_INTERFACE_PORT}`;
  let qrCode: string | null = null;
  try {
    // as a drawing (SVG): that needs no canvas, which KweenB does not have here
    const drawing = await QRCode.toString(networkUrl, {
      type: "svg",
      margin: 2,
    });
    qrCode = `data:image/svg+xml;utf8,${encodeURIComponent(drawing)}`;
  } catch (e) {
    console.error(e);
  }
  return { localUrl, networkUrl, qrCode };
};

/**
 * Open the remote interface in the browser of this computer
 */
export const openRemoteInterface = () => {
  shell.openExternal(`http://localhost:${REMOTE_INTERFACE_PORT}`);
};
