/**
 * The firmware files for the bees and the satellite. They are kept in the
 * bucket of the backups (folder firmware/), so they can only be seen with a
 * backup key. The newest of each kind is copied to this computer, so devices
 * can be updated where there is no internet.
 */

import fs from "fs";
import path from "path";
import { IFirmwareOffer, UpdateDeviceKind } from "@shared/interfaces";
import {
  R2Operation,
  R2Settings,
  getFile,
  listObjects,
} from "../CloudBackup/R2Client";
import {
  FIRMWARE_PREFIX,
  firmwareOfName,
  manifestFits,
  manifestOf,
  newestFirmware,
} from "./Versions";

const KINDS: UpdateDeviceKind[] = ["bee", "satellite"];

/**
 * Read the description at the start of a firmware file on this computer
 */
const readManifest = async (filePath: string) => {
  const file = await fs.promises.open(filePath, "r");
  try {
    const start = Buffer.alloc(8192);
    const { bytesRead } = await file.read(start, 0, start.length, 0);
    return manifestOf(start.subarray(0, bytesRead));
  } finally {
    await file.close();
  }
};

/**
 * The firmware files on this computer: the newest of each kind
 * @param folder Where KweenB keeps them
 */
export const firmwareHere = async (
  folder: string
): Promise<Partial<Record<UpdateDeviceKind, IFirmwareOffer>>> => {
  let names: string[] = [];
  try {
    names = await fs.promises.readdir(folder);
  } catch (e) {
    return {};
  }
  const newest = newestFirmware(names.map((name) => ({ name })));
  const offers: Partial<Record<UpdateDeviceKind, IFirmwareOffer>> = {};
  await Promise.all(
    KINDS.map(async (kind) => {
      const file = newest[kind];
      if (!file) return;
      const manifest = await readManifest(path.join(folder, file.name)).catch(
        () => null
      );
      // a file that does not hold what its name says is not offered
      if (!manifestFits(manifest, kind, file.version)) return;
      offers[kind] = {
        kind,
        version: file.version,
        requiresImage: manifest?.requiresImage || null,
      };
    })
  );
  return offers;
};

/**
 * The file of a firmware on this computer
 */
export const firmwareFile = (folder: string, offer: IFirmwareOffer): string =>
  path.join(
    folder,
    `zwerm3-${offer.kind === "bee" ? "speaker" : "satellite"}-firmware-${
      offer.version
    }.zfw`
  );

/**
 * Look in the cloud for newer firmware and copy it to this computer
 * @returns The versions that were fetched
 */
export const fetchNewFirmware = async (
  settings: R2Settings,
  folder: string,
  operation?: R2Operation
): Promise<string[]> => {
  const inCloud = newestFirmware(
    (await listObjects(settings, FIRMWARE_PREFIX, operation)).map((object) => ({
      name: object.key,
    }))
  );
  const here = await firmwareHere(folder);
  const fetched: string[] = [];
  await fs.promises.mkdir(folder, { recursive: true });

  for (const kind of KINDS) {
    const newest = inCloud[kind];
    const have = here[kind];
    if (!newest || (have && newest.version === have.version)) continue;
    const name = firmwareOfName(newest.name)?.file as string;
    // eslint-disable-next-line no-await-in-loop
    await getFile(settings, newest.name, path.join(folder, name), operation);
    fetched.push(newest.version);
    // eslint-disable-next-line no-await-in-loop
    const leftovers = (await fs.promises.readdir(folder)).filter(
      (other) => other !== name && firmwareOfName(other)?.kind === kind
    );
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(
      leftovers.map((other) =>
        fs.promises.rm(path.join(folder, other), { force: true })
      )
    );
  }
  return fetched;
};
