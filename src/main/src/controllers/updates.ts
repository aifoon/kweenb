/**
 * Updates (File → Check for Updates…): a new version of KweenB itself, and
 * new firmware for the bees and the satellites.
 */

import { app, shell } from "electron";
import path from "path";
import {
  IFirmwareOffer,
  IUpdateAnswer,
  IUpdateDevice,
  IUpdateProgress,
  IUpdatesState,
  UpdateDeviceKind,
} from "@shared/interfaces";
import { BeeActiveState } from "@shared/enums";
import { KweenBGlobal } from "../kweenb";
import { USER_DATA, ZWERM3API_PORT } from "../consts";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import SatelliteSync from "../lib/Satellite/SatelliteSync";
import { R2Error } from "../lib/CloudBackup/R2Client";
import { readCloudSettings } from "./cloud-backup";
import {
  KweenBRelease,
  RELEASES_PAGE,
  downloadInstaller,
  isNewerRelease,
  latestRelease,
} from "../lib/Updates/AppUpdate";
import {
  fetchNewFirmware,
  firmwareFile,
  firmwareHere,
} from "../lib/Updates/FirmwareStore";
import {
  DeviceAddress,
  DeviceUpdateError,
  getDeviceInfo,
  restartDevice,
  sendFirmware,
  waitForFirmware,
} from "../lib/Updates/DeviceUpdate";
import { stateOfDevice } from "../lib/Updates/Versions";

// where the newest firmware files are kept on this computer
const FIRMWARE_FOLDER = path.join(USER_DATA, "firmware");

// what the last check found
let release: KweenBRelease | null = null;
let offers: Partial<Record<UpdateDeviceKind, IFirmwareOffer>> = {};
const addresses = new Map<string, DeviceAddress>();
// the devices that are being updated right now
const updating = new Set<string>();
let downloadingKweenB = false;

const tell = (progress: IUpdateProgress) => {
  const window = KweenBGlobal.kweenb?.mainWindow;
  if (window && !window.isDestroyed())
    window.webContents.send("update-progress", progress);
};

const addressOfBee = (ipAddress: string): DeviceAddress => {
  const base = `http://${ipAddress}:${ZWERM3API_PORT}`;
  return {
    statusUrl: `${base}/status`,
    firmwareUrl: `${base}/firmware`,
    restartUrl: `${base}/system/reboot`,
  };
};

const addressOfSatellite = (host: string, port: number): DeviceAddress => {
  const base = `http://${host}:${port}/api`;
  return {
    statusUrl: `${base}/status`,
    firmwareUrl: `${base}/firmware`,
    restartUrl: `${base}/system/reboot`,
  };
};

/**
 * Ask a device what it runs and work out what can be done for it
 * @returns null for a device that does not answer
 */
const describe = async (
  key: string,
  kind: UpdateDeviceKind,
  name: string,
  address: DeviceAddress
): Promise<IUpdateDevice | null> => {
  const info = await getDeviceInfo(address).catch(() => null);
  if (info === null) return null;
  addresses.set(key, address);
  const { state, target, why } = stateOfDevice(
    kind === "bee" ? "bee" : "satellite",
    info.firmware,
    info.image,
    offers[kind] || null
  );
  return {
    key,
    kind,
    name,
    image: info.image,
    firmware: info.firmware?.version || null,
    state,
    target,
    why,
    playing: info.status?.stream?.state === "running",
    batteryLow: info.status?.battery?.level === "low",
  };
};

/**
 * The bees and satellites that are on the network now
 */
const findDevices = async (): Promise<IUpdateDevice[]> => {
  const [bees, satellites] = await Promise.all([
    BeeHelpers.getAllBees(BeeActiveState.ALL).catch(() => []),
    SatelliteSync.findSatellites().catch(() => []),
  ]);
  const found = await Promise.all([
    ...bees
      .sort((a, b) => a.id - b.id)
      .map((bee) =>
        describe(`bee:${bee.id}`, "bee", bee.name, addressOfBee(bee.ipAddress))
      ),
    ...satellites.map((satellite) =>
      describe(
        `satellite:${satellite.host}:${satellite.port}`,
        "satellite",
        satellite.name,
        addressOfSatellite(satellite.host, satellite.port)
      )
    ),
  ]);
  return found.filter((device): device is IUpdateDevice => device !== null);
};

/**
 * Look for a new KweenB and for new firmware, and see what the devices on
 * the network run
 */
export const checkForUpdates = async (): Promise<IUpdatesState> => {
  const current = app.getVersion();

  // KweenB itself
  let kweenbMessage: string | null = null;
  try {
    release = await latestRelease();
  } catch (e) {
    kweenbMessage =
      "KweenB could not look for a new version. Is this computer on the internet?";
  }

  // firmware: only with a backup key, as it is kept with the backups
  let firmwareMessage: string | null = null;
  const settings = await readCloudSettings().catch(() => null);
  if (settings) {
    try {
      await fetchNewFirmware(settings, FIRMWARE_FOLDER);
    } catch (e) {
      firmwareMessage = `KweenB could not look for new firmware${
        e instanceof R2Error ? ` (${e.message})` : ""
      }. What is shown is the firmware that is on this computer already.`;
    }
  }
  offers = await firmwareHere(FIRMWARE_FOLDER);

  return {
    kweenb: {
      current,
      latest: release?.version || null,
      available: release !== null && isNewerRelease(release, current),
      message: kweenbMessage,
    },
    firmware: {
      hasKey: settings !== null,
      message: firmwareMessage,
      bee: offers.bee || null,
      satellite: offers.satellite || null,
    },
    devices: await findDevices(),
  };
};

/**
 * At the start of KweenB: look quietly, and only tell when there is
 * something to do. Nothing is installed by this.
 */
export const checkForUpdatesAtStart = async () => {
  try {
    const state = await checkForUpdates();
    const waiting = state.devices.filter((d) => d.state === "update").length;
    if (!state.kweenb.available && waiting === 0) return;
    const window = KweenBGlobal.kweenb?.mainWindow;
    if (window && !window.isDestroyed())
      window.webContents.send("updates-available", state);
  } catch (e) {
    // looking for updates never gets in the way of working
  }
};

/**
 * Send the newest firmware to a device, restart it, and wait until it tells
 * that it works
 * @param key The device, as named by checkForUpdates
 */
export const updateDevice = async (
  event: Electron.IpcMainInvokeEvent,
  key: string
): Promise<IUpdateAnswer> => {
  const kind: UpdateDeviceKind = String(key).startsWith("satellite:")
    ? "satellite"
    : "bee";
  const address = addresses.get(key);
  const offer = offers[kind];
  if (!address || !offer)
    return { success: false, message: "Look for updates again first." };
  if (updating.has(key))
    return { success: false, message: "This device is being updated already." };

  updating.add(key);
  try {
    const before = await getDeviceInfo(address).catch(() => null);
    if (before === null)
      throw new DeviceUpdateError("The device does not answer any more.");

    // a firmware that was sent before and only waits for a restart is not
    // sent again
    if (before.firmware?.pending !== offer.version) {
      tell({ key, step: "sending" });
      await sendFirmware(address, firmwareFile(FIRMWARE_FOLDER, offer));
    }
    tell({ key, step: "restarting" });
    await restartDevice(address);
    await waitForFirmware(address, offer.version, before.uptimeSeconds);
    tell({ key, step: "done" });
    return { success: true };
  } catch (e: any) {
    const message =
      e instanceof DeviceUpdateError
        ? e.message
        : "The update failed. Try again.";
    tell({ key, step: "failed", message });
    return { success: false, message };
  } finally {
    updating.delete(key);
  }
};

/**
 * Download the installer of the new KweenB to the Downloads folder and open
 * it. Without an installer for this computer the page of the release opens.
 */
export const downloadKweenB = async (): Promise<IUpdateAnswer> => {
  if (!release || !release.installer) {
    await shell.openExternal(release?.page || RELEASES_PAGE);
    return { success: true, message: "The page of the new version is open in the browser." };
  }
  if (downloadingKweenB)
    return { success: false, message: "KweenB is being downloaded already." };
  downloadingKweenB = true;
  try {
    let lastTold = -1;
    const file = await downloadInstaller(
      release.installer,
      app.getPath("downloads"),
      (part) => {
        const percentage = Math.floor(part * 100);
        if (percentage === lastTold) return;
        lastTold = percentage;
        tell({ key: "kweenb", step: "sending", percentage });
      }
    );
    tell({ key: "kweenb", step: "done" });
    // on a Mac this shows the new KweenB, ready to be dragged to Applications
    const problem = await shell.openPath(file);
    if (problem) shell.showItemInFolder(file);
    return { success: true, message: file };
  } catch (e) {
    const message = "The download broke off. Try again.";
    tell({ key: "kweenb", step: "failed", message });
    return { success: false, message };
  } finally {
    downloadingKweenB = false;
  }
};
