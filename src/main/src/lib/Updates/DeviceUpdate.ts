/**
 * Sending a firmware to a device (a bee or a satellite) and seeing it
 * through its restart. Both kinds take a firmware the same way; only their
 * addresses differ.
 */

import crypto from "crypto";
import fs from "fs";
import http from "http";
import { DeviceFirmware } from "./Versions";

export interface DeviceAddress {
  // where the device tells what it runs
  statusUrl: string;
  // where it takes a firmware file (PUT)
  firmwareUrl: string;
  // where it is asked to restart (POST)
  restartUrl: string;
}

export interface DeviceInfo {
  firmware: (DeviceFirmware & { confirmed?: boolean }) | null;
  image: string | null;
  // seconds since the device started
  uptimeSeconds: number | null;
  // everything else the device told
  status: any;
}

// a device that does not answer fast is gone
const STATUS_TIMEOUT_MS = 3000;
// sending may take as long as it needs, as long as data keeps moving; the
// device then checks and unpacks the file
const SEND_IDLE_TIMEOUT_MS = 30000;
const INSTALL_TIMEOUT_MS = 200000;
// a restart, and the half minute in which the device sees that the new
// firmware works
const RESTART_TIMEOUT_MS = 240000;

export class DeviceUpdateError extends Error {}

const checksumOfFile = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    fs.createReadStream(filePath)
      .on("error", reject)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")));
  });

const messageOf = (body: string, statusCode: number): string => {
  try {
    const { message } = JSON.parse(body);
    if (Array.isArray(message) && message.length > 0) return message.join(", ");
    if (typeof message === "string" && message) return message;
  } catch (e) {
    // not JSON
  }
  return `The device answered with an error (${statusCode})`;
};

/**
 * Ask a device what it runs
 */
export const getDeviceInfo = async (
  address: DeviceAddress
): Promise<DeviceInfo> => {
  const response = await fetch(address.statusUrl, {
    signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
  });
  if (!response.ok) throw new DeviceUpdateError("The device did not answer");
  const status = (await response.json()) as any;
  const uptime = status.uptimeSeconds ?? status.uptime;
  return {
    firmware:
      typeof status.firmware?.version === "string" ? status.firmware : null,
    image:
      typeof status.image?.version === "string" ? status.image.version : null,
    uptimeSeconds: Number.isFinite(uptime) ? Number(uptime) : null,
    status,
  };
};

/**
 * Send a firmware file to a device. The device checks it and keeps it for
 * its next start.
 */
export const sendFirmware = async (
  address: DeviceAddress,
  filePath: string
): Promise<void> => {
  const { size } = await fs.promises.stat(filePath);
  const sha256 = await checksumOfFile(filePath);

  // fetch can not send a file of a known length as a stream
  await new Promise<void>((resolve, reject) => {
    const file = fs.createReadStream(filePath);
    let settled = false;
    const settle = (error?: Error) => {
      if (settled) return;
      settled = true;
      file.destroy();
      if (error) {
        req.destroy();
        reject(error);
      } else resolve();
    };
    const req: http.ClientRequest = http.request(
      address.firmwareUrl,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": size,
          "X-Sha256": sha256,
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("error", () =>
          settle(new DeviceUpdateError("The connection was lost"))
        );
        response.on("end", () => {
          const status = response.statusCode || 0;
          if (status >= 200 && status < 300) settle();
          else if (status === 404)
            settle(
              new DeviceUpdateError(
                "This device cannot take a firmware over the network. Write a new image to it (File → Flash)."
              )
            );
          else
            settle(
              new DeviceUpdateError(
                messageOf(Buffer.concat(chunks).toString("utf8"), status)
              )
            );
        });
      }
    );
    // while sending: silence means the device is gone; after that the
    // device is busy with the file
    req.setTimeout(SEND_IDLE_TIMEOUT_MS, () => {
      if (!file.destroyed && file.bytesRead < size)
        settle(new DeviceUpdateError("The device stopped answering"));
    });
    const installTimeout = setTimeout(
      () =>
        settle(new DeviceUpdateError("The device did not finish installing")),
      INSTALL_TIMEOUT_MS
    );
    req.on("close", () => clearTimeout(installTimeout));
    req.on("error", () =>
      settle(new DeviceUpdateError("The device can not be reached"))
    );
    file.on("error", () =>
      settle(new DeviceUpdateError("The firmware file could not be read"))
    );
    file.pipe(req);
  });
};

/**
 * Ask a device to restart
 */
export const restartDevice = async (address: DeviceAddress): Promise<void> => {
  const response = await fetch(address.restartUrl, {
    method: "POST",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new DeviceUpdateError(
      messageOf(await response.text(), response.status)
    );
};

const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Wait until a device is back after its restart and tells whether it works
 * with the new firmware
 * @param version The firmware it should come back with
 * @returns What the device runs now
 * @throws DeviceUpdateError when it came back with another firmware, or not at all
 */
export const waitForFirmware = async (
  address: DeviceAddress,
  version: string,
  uptimeBefore: number | null,
  timeoutMs: number = RESTART_TIMEOUT_MS,
  pollMs: number = 2000
): Promise<DeviceInfo> => {
  const deadline = Date.now() + timeoutMs;
  let wentAway = false;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    await pause(pollMs);
    // eslint-disable-next-line no-await-in-loop
    const info = await getDeviceInfo(address).catch(() => null);
    if (info === null) {
      wentAway = true;
      continue;
    }
    const restarted =
      wentAway ||
      (uptimeBefore !== null &&
        info.uptimeSeconds !== null &&
        info.uptimeSeconds < uptimeBefore);
    if (!restarted || info.firmware === null) continue;
    // with the new firmware, and the device saw that it works
    if (info.firmware.version === version) {
      if (info.firmware.confirmed !== false) return info;
      continue;
    }
    // back with another firmware: the device put the new one aside
    if (info.firmware.pending !== version)
      throw new DeviceUpdateError(
        info.firmware.failed?.version === version
          ? `The device did not work with firmware ${version} and went back to ${info.firmware.version} (${info.firmware.failed.reason}).`
          : `The device came back with firmware ${info.firmware.version} instead of ${version}.`
      );
  }
  throw new DeviceUpdateError(
    wentAway
      ? "The device did not come back after its restart. Check that it is switched on; it goes back to its previous firmware by itself when the new one does not work."
      : "The device did not restart."
  );
};
