/**
 * KweenB's own sound device ("KweenB Swarm"): a DAW plays to it, KweenB
 * picks its channels up and sends them to the bees. It is a build of
 * BlackHole under KweenB's name (see sound-device/build.sh).
 *
 * Nothing in here needs Electron, so it can be tested on its own.
 */

import { execFile, spawn } from "child_process";
import fs from "fs";
import path from "path";
import {
  buildAdministratorAppleScript,
  quoteForShell,
} from "../SpeakerFlash/PrivilegedScript";

export const SOUND_DEVICE_NAME = "KweenB Swarm";
// the name Jack opens the device with
export const SOUND_DEVICE_UID = "KweenBSwarm_UID";
export const SOUND_DEVICE_CHANNELS = 64;

const DRIVER = "KweenBSwarm.driver";
const DRIVER_BINARY = path.join("Contents", "MacOS", "KweenBSwarm");
// where the Mac looks for sound devices like this one
const DRIVERS_FOLDER = "/Library/Audio/Plug-Ins/HAL";
export const INSTALLED_DRIVER = path.join(DRIVERS_FOLDER, DRIVER);

const PASSWORD_PROMPT =
  "KweenB wants to install its sound device (KweenB Swarm).";

export interface SoundDeviceState {
  // can this computer have the device at all
  supported: boolean;
  installed: boolean;
  // false when this KweenB comes with a newer device than the installed one
  upToDate: boolean;
}

/**
 * The version of a device, from its Info.plist ("0.7.1 (1)"). Not a checksum
 * of the device itself: every KweenB that is built signs the device anew, so
 * the same device is a different file in every KweenB.
 */
const versionOf = (driver: string): string | null => {
  try {
    const plist = fs.readFileSync(
      path.join(driver, "Contents", "Info.plist"),
      "utf8"
    );
    const value = (key: string) =>
      plist.match(
        new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`)
      )?.[1];
    const version = value("CFBundleShortVersionString");
    if (!version) return null;
    return `${version} (${value("CFBundleVersion") || ""})`;
  } catch (e) {
    return null;
  }
};

/**
 * Is the sound device on this computer, and is it the one of this KweenB.
 * A new device is told apart by its version: raise CFBundleVersion in
 * sound-device/build.sh when the device changes.
 * @param bundledFolder The folder with the device that comes with KweenB
 * @param installedDriver Where the device is installed (tests)
 */
export const getSoundDeviceState = (
  bundledFolder: string,
  installedDriver: string = INSTALLED_DRIVER
): SoundDeviceState => {
  const bundledDriver = path.join(bundledFolder, DRIVER);
  const bundled = versionOf(bundledDriver);
  const installed = versionOf(installedDriver);
  return {
    supported:
      process.platform === "darwin" &&
      fs.existsSync(path.join(bundledDriver, DRIVER_BINARY)),
    installed: fs.existsSync(path.join(installedDriver, DRIVER_BINARY)),
    upToDate: installed !== null && installed === bundled,
  };
};

/**
 * The script that puts the device in place and lets the Mac find it. It
 * runs with administrator rights.
 * @param bundledDriver The device that comes with KweenB
 * @param installedDriver Where it goes
 * @param restartSound false leaves the sound system of the Mac alone (tests)
 */
export const buildInstallScript = (
  bundledDriver: string,
  installedDriver: string = INSTALLED_DRIVER,
  restartSound: boolean = true
): string => {
  if (!path.isAbsolute(bundledDriver) || !path.isAbsolute(installedDriver))
    throw new Error("The sound device has to be given with full paths.");
  if (path.basename(installedDriver) !== DRIVER)
    throw new Error("Only KweenB's own sound device is installed.");
  const lines = [
    `SRC=${quoteForShell(bundledDriver)}`,
    `DST=${quoteForShell(installedDriver)}`,
    `[ -f "$SRC/${DRIVER_BINARY}" ] || exit 3`,
    `/bin/mkdir -p "$(/usr/bin/dirname "$DST")" || exit 4`,
    // the new device is copied next to the old one first, so a copy that
    // fails does not leave the computer without the device
    `/bin/rm -rf "$DST.new" || exit 4`,
    `/bin/cp -R "$SRC" "$DST.new" || { /bin/rm -rf "$DST.new"; exit 4; }`,
    // only ever KweenB's own device is replaced
    `/bin/rm -rf "$DST" || exit 4`,
    `/bin/mv "$DST.new" "$DST" || exit 4`,
  ];
  if (restartSound)
    lines.push(
      `/usr/sbin/chown -R root:wheel "$DST" || exit 4`,
      // the sound system of the Mac starts again and finds the new device
      `/usr/bin/killall -9 coreaudiod || /bin/launchctl kickstart -k system/com.apple.audio.coreaudiod || exit 5`
    );
  lines.push("exit 0");
  return lines.join("\n");
};

export type InstallOutcome =
  | "installed"
  // the user did not give the password
  | "cancelled"
  | "failed";

/**
 * Install the device. The Mac asks for the password of an administrator;
 * the sound of the Mac stops for a moment.
 * @param bundledFolder The folder with the device that comes with KweenB
 */
export const installSoundDevice = (
  bundledFolder: string
): Promise<InstallOutcome> =>
  new Promise((resolve) => {
    let script: string;
    try {
      script = buildInstallScript(path.join(bundledFolder, DRIVER));
    } catch (e) {
      resolve("failed");
      return;
    }
    const child = spawn(
      "/usr/bin/osascript",
      ["-e", buildAdministratorAppleScript(script, PASSWORD_PROMPT)],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk.toString()));
    child.stderr.on("data", (chunk) => (output += chunk.toString()));
    child.on("error", () => resolve("failed"));
    child.on("close", (code) => {
      if (code === 0) resolve("installed");
      else if (/-128|cancel/i.test(output)) resolve("cancelled");
      else {
        console.error(`Installing the sound device failed: ${output}`);
        resolve("failed");
      }
    });
  });

export interface SystemSoundDevice {
  name: string;
  // the name Jack opens the device with
  uid: string;
  inputChannels: number;
  outputChannels: number;
}

/**
 * Read what the tool that lists the sound devices printed
 */
export const parseSoundDevices = (output: string): SystemSoundDevice[] => {
  try {
    const devices = JSON.parse(output);
    if (!Array.isArray(devices)) return [];
    return devices
      .filter(
        (device) =>
          device &&
          typeof device.name === "string" &&
          typeof device.uid === "string" &&
          device.uid !== ""
      )
      .map((device) => ({
        name: device.name,
        uid: device.uid,
        inputChannels: Number(device.inputChannels) || 0,
        outputChannels: Number(device.outputChannels) || 0,
      }));
  } catch (e) {
    return [];
  }
};

/**
 * The sound devices of this computer (empty when they can not be listed)
 * @param bundledFolder The folder with the device that comes with KweenB
 */
export const listSoundDevices = (
  bundledFolder: string
): Promise<SystemSoundDevice[]> =>
  new Promise((resolve) => {
    if (process.platform !== "darwin") {
      resolve([]);
      return;
    }
    execFile(
      path.join(bundledFolder, "list-devices"),
      [],
      { timeout: 5000 },
      (error, stdout) => resolve(error ? [] : parseSoundDevices(stdout))
    );
  });

/**
 * Does the Mac show the device (it can take a few seconds after installing)
 */
export const isSoundDeviceVisible = (): Promise<boolean> =>
  new Promise((resolve) => {
    execFile(
      "/usr/sbin/system_profiler",
      ["SPAudioDataType"],
      { timeout: 15000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout) =>
        resolve(!error && stdout.includes(`${SOUND_DEVICE_NAME}:`))
    );
  });
