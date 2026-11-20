/**
 * Versions of KweenB and of the firmware of the devices (bees and
 * satellites), and what follows from them.
 *
 * Nothing in here needs Electron, so it can be tested on its own.
 */

import {
  IFirmwareOffer,
  UpdateDeviceKind,
  UpdateDeviceState,
} from "@shared/interfaces";

// where the firmware files are in the bucket of the backups
export const FIRMWARE_PREFIX = "firmware/";

// the kind of device in the name of a firmware file
const DEVICE_OF_KIND: Record<UpdateDeviceKind, string> = {
  bee: "speaker",
  satellite: "satellite",
};

const numbersOf = (version: string): number[] =>
  version
    .replace(/^v/, "")
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

/**
 * Compare two versions like 2.1.0
 * @returns above 0 when a is newer, below 0 when b is newer
 */
export const compareVersions = (a: string, b: string): number => {
  const [one, other] = [numbersOf(a), numbersOf(b)];
  for (let i = 0; i < Math.max(one.length, other.length); i += 1) {
    const difference = (one[i] || 0) - (other[i] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
};

export const isNewer = (a: string, b: string): boolean =>
  compareVersions(a, b) > 0;

/**
 * What the name of a firmware file tells: zwerm3-speaker-firmware-2.1.0.zfw
 * @param name The name of the file, with or without the folder it is in
 */
export const firmwareOfName = (
  name: string
): { kind: UpdateDeviceKind; version: string; file: string } | null => {
  const file = name.split("/").pop() || "";
  const match = /^zwerm3-(speaker|satellite)-firmware-(\d+\.\d+\.\d+)\.zfw$/.exec(
    file
  );
  if (!match) return null;
  return {
    kind: match[1] === "speaker" ? "bee" : "satellite",
    version: match[2],
    file,
  };
};

/**
 * The newest firmware file for every kind of device
 */
export const newestFirmware = <T extends { name: string }>(
  files: T[]
): Partial<Record<UpdateDeviceKind, T & { version: string }>> => {
  const newest: Partial<Record<UpdateDeviceKind, T & { version: string }>> = {};
  files.forEach((file) => {
    const firmware = firmwareOfName(file.name);
    if (!firmware) return;
    const best = newest[firmware.kind];
    if (!best || isNewer(firmware.version, best.version))
      newest[firmware.kind] = { ...file, version: firmware.version };
  });
  return newest;
};

/**
 * Read the description at the start of a firmware file. The file is a tar
 * archive that begins with manifest.json.
 * @param start The first kilobytes of the file
 */
export const manifestOf = (
  start: Buffer
): { device: string; version: string; requiresImage: string | null } | null => {
  try {
    const name = start.subarray(0, 100).toString("utf8").replace(/\0.*$/, "");
    if (name !== "manifest.json") return null;
    const size = parseInt(
      start.subarray(124, 136).toString("utf8").replace(/\0.*$/, "").trim(),
      8
    );
    if (!Number.isFinite(size) || size <= 0 || 512 + size > start.length)
      return null;
    const manifest = JSON.parse(
      start.subarray(512, 512 + size).toString("utf8")
    );
    if (
      typeof manifest.device !== "string" ||
      typeof manifest.version !== "string"
    )
      return null;
    return {
      device: manifest.device,
      version: manifest.version,
      requiresImage:
        typeof manifest.requiresImage === "string" && manifest.requiresImage
          ? manifest.requiresImage
          : null,
    };
  } catch (e) {
    return null;
  }
};

/**
 * Does a firmware file hold what its name says
 */
export const manifestFits = (
  manifest: { device: string; version: string } | null,
  kind: UpdateDeviceKind,
  version: string
): boolean =>
  manifest !== null &&
  manifest.device === DEVICE_OF_KIND[kind] &&
  manifest.version === version;

/**
 * What a device tells about its firmware (the speaker API and the satellite
 * tell it the same way)
 */
export interface DeviceFirmware {
  version: string;
  pending?: string | null;
  confirmed?: boolean;
  failed?: { version: string; reason: string } | null;
}

/**
 * What can be done for a device, given the firmware KweenB has for it
 * @param firmware What the device runs; null when its image cannot take a firmware
 * @param image The date of the image of the device, like 2026-11-18
 * @param offer The newest firmware KweenB has for this kind of device
 */
export const stateOfDevice = (
  kindInWords: string,
  firmware: DeviceFirmware | null,
  image: string | null,
  offer: IFirmwareOffer | null
): { state: UpdateDeviceState; target: string | null; why: string | null } => {
  if (firmware === null)
    return {
      state: "needs-image",
      target: null,
      why: `This ${kindInWords} has an image from before firmware could be sent over the network. Write a new image to it (File → Flash).`,
    };
  if (firmware.pending)
    return {
      state: "restart",
      target: firmware.pending,
      why: `Firmware ${firmware.pending} is installed and is used after a restart.`,
    };
  if (!offer || !isNewer(offer.version, firmware.version))
    return { state: offer ? "current" : "no-offer", target: null, why: null };
  // image dates compare as text: 2026-11-18
  if (offer.requiresImage && (image === null || offer.requiresImage > image))
    return {
      state: "needs-image",
      target: null,
      why: `Firmware ${offer.version} needs the image of ${offer.requiresImage} or later. Write a new image to this ${kindInWords} (File → Flash).`,
    };
  return {
    state: "update",
    target: offer.version,
    why:
      firmware.failed && firmware.failed.version === offer.version
        ? `Firmware ${offer.version} was tried before and put aside: ${firmware.failed.reason}.`
        : null,
  };
};
