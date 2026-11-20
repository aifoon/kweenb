/**
 * Keeping KweenB and the satellite the same. The satellite is a Raspberry Pi
 * that serves the trigger interface on walks (the project kweenb-pi).
 *
 * One sync always does two things, in this order:
 *  1. the compositions that were made or changed on the satellite come to
 *     KweenB (nothing made on a walk is lost);
 *  2. the bees, scenes and compositions of KweenB go to the satellite and
 *     replace what it had.
 *
 * It starts from "Send to Satellite…" in KweenB, or from the button on the
 * satellite that appears when it holds new compositions.
 */

import { randomUUID } from "crypto";
import os from "os";
import { Bonjour } from "bonjour-service";
import {
  ISatellite,
  ISatelliteSyncResult,
  InterfaceComposition,
} from "@shared/interfaces";
import { BeeActiveState } from "@shared/enums";
import Database from "../../database";
import AudioSceneDB from "../../models/AudioScene";
import InterfaceCompositionDB from "../../models/InterfaceComposition";
import InterfaceCompositionBeeDB from "../../models/InterfaceCompostionBee";
import BeeHelpers from "../KweenB/BeeHelpers";
import InterfaceHelpers from "../KweenB/InterfaceHelpers";
import { REMOTE_INTERFACE_PORT } from "../../consts";
import { compositionHash } from "./CompositionHash";

// what KweenB and the satellite announce on the network
// (_kweenb._tcp and _kweenb-satellite._tcp)
const KWEENB_SERVICE = "kweenb";
const SATELLITE_SERVICE = "kweenb-satellite";

// the name the satellite image gives a satellite, tried when none announced
// itself
const DEFAULT_SATELLITE_HOST = "satellite.local";
const DEFAULT_SATELLITE_PORT = 80;

const LOOK_FOR_MS = 2500;
const ASK_TIMEOUT_MS = 8000;
const SEND_TIMEOUT_MS = 60000;

/**
 * A composition as the satellite reports it
 */
interface SatelliteComposition {
  uid: string;
  name: string;
  // the fingerprint KweenB gave it at the last sync; null when it was made
  // on the satellite
  baseHash: string | null;
  // the fingerprint it has now
  hash: string;
  items: {
    beeId: number;
    beeName?: string;
    sceneName: string;
    localFolderPath: string;
    isLooping: boolean;
  }[];
}

/**
 * A composition that was deleted on the satellite
 */
interface DeletedOnSatellite {
  uid: string;
  name: string;
  // the fingerprint KweenB gave it at the last sync
  baseHash: string | null;
}

/**
 * A composition as KweenB sends it
 */
interface SentComposition {
  id: number;
  uid: string;
  hash: string;
  name: string;
  composition: {
    bee: { id: number; name: string };
    audioScene: { name: string; oscAddress: string; localFolderPath: string };
    isLooping: boolean;
  }[];
}

const request = async <T>(
  url: string,
  timeoutMs: number,
  body?: unknown
): Promise<T> => {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok)
    throw new Error(`The satellite answered with ${response.status}`);
  return (await response.json()) as T;
};

/**
 * Everything the satellite needs: the active bees, their scenes and the
 * compositions
 */
const buildSyncData = async () => {
  const bees = (await BeeHelpers.getAllBees(BeeActiveState.ACTIVE)).map(
    ({
      id,
      name,
      ipAddress,
      isActive,
      channelType,
      channel1,
      channel2,
      pozyxTagId,
    }) => ({
      id,
      name,
      ipAddress,
      isActive,
      channelType,
      channel1,
      channel2,
      pozyxTagId,
    })
  );

  const audioScenes = (await BeeHelpers.getAudioScenes()).map(
    ({ id, name, oscAddress, localFolderPath, foundOnBees }) => ({
      id,
      name,
      oscAddress,
      localFolderPath,
      foundOnBees: foundOnBees.map((bee) => ({ id: bee.id, name: bee.name })),
    })
  );

  const uids = new Map<number, string>();
  (await InterfaceCompositionDB.findAll()).forEach((row) =>
    uids.set(row.dataValues.id, row.dataValues.uid)
  );
  const compositions: SentComposition[] = (
    (await InterfaceHelpers.getInterfaceCompositions()) as InterfaceComposition[]
  ).map((interfaceComposition) => {
    // a place without its bee or scene (removed since) is left out
    const composition = interfaceComposition.composition
      .filter((item) => item.bee && item.audioScene)
      .map((item) => ({
        bee: { id: item.bee.id, name: item.bee.name },
        audioScene: {
          name: item.audioScene!.name,
          oscAddress: item.audioScene!.oscAddress,
          localFolderPath: item.audioScene!.localFolderPath,
        },
        isLooping: Boolean(item.isLooping),
      }));
    return {
      id: interfaceComposition.id,
      uid: uids.get(interfaceComposition.id) || "",
      name: interfaceComposition.name,
      hash: compositionHash(
        interfaceComposition.name,
        composition.map((item) => ({
          beeId: item.bee.id,
          localFolderPath: item.audioScene.localFolderPath,
          isLooping: item.isLooping,
        }))
      ),
      composition,
    };
  });

  return {
    bees,
    audioScenes,
    compositions,
    syncedAt: new Date().toISOString(),
  };
};

/**
 * Write a composition of the satellite into the database of KweenB
 * @param existingId The composition to replace, null to make a new one
 * @returns How many places could not be filled (the scene is not on that
 * bee any more)
 */
const writeComposition = async (
  composition: SatelliteComposition,
  name: string,
  uid: string,
  existingId: number | null
): Promise<number> => {
  let emptyPlaces = 0;
  const places: { beeId: number; audioSceneId: number; isLooping: boolean }[] =
    [];
  for (const item of composition.items) {
    const scene = await AudioSceneDB.findOne({
      where: {
        beeId: item.beeId,
        localFolderPath: item.localFolderPath,
        markedForDeletion: false,
      },
    });
    if (scene)
      places.push({
        beeId: item.beeId,
        audioSceneId: scene.dataValues.id,
        isLooping: Boolean(item.isLooping),
      });
    else emptyPlaces += 1;
  }

  const transaction = await Database.sequelize.transaction();
  try {
    let id = existingId;
    if (id === null) {
      const created = await InterfaceCompositionDB.create(
        { name, uid },
        { transaction }
      );
      id = created.dataValues.id as number;
    } else {
      await InterfaceCompositionDB.update(
        { name },
        { where: { id }, transaction }
      );
      await InterfaceCompositionBeeDB.destroy({
        where: { interfaceCompositionId: id },
        transaction,
      });
    }
    await InterfaceCompositionBeeDB.bulkCreate(
      places.map((place) => ({ ...place, interfaceCompositionId: id })),
      { transaction }
    );
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
  return emptyPlaces;
};

/**
 * Take over what was made or changed on the satellite.
 *  - not in KweenB yet: added
 *  - changed on the satellite only: the one in KweenB is updated
 *  - changed on both sides: both are kept, the one of the satellite with
 *    "(satellite)" behind its name
 *  - deleted on the satellite and not changed in KweenB since: deleted
 *    here too; changed in KweenB since: it stays
 */
const takeOverFromSatellite = async (
  changed: SatelliteComposition[],
  deleted: DeletedOnSatellite[]
): Promise<
  Pick<ISatelliteSyncResult, | "added"
    | "updated"
    | "keptBoth"
    | "deleted"
    | "keptDespiteDelete"
    | "emptyPlaces">
> => {
  const result = {
    added: [] as string[],
    updated: [] as string[],
    keptBoth: [] as string[],
    deleted: [] as string[],
    keptDespiteDelete: [] as string[],
    emptyPlaces: 0,
  };
  const ownHashes = new Map<string, string>();
  (await buildSyncData()).compositions.forEach(({ uid, hash }) =>
    ownHashes.set(uid, hash)
  );

  for (const composition of changed) {
    if (!composition || !composition.uid || !Array.isArray(composition.items))
      continue;
    const own = await InterfaceCompositionDB.findOne({
      where: { uid: composition.uid },
    });

    if (!own) {
      result.emptyPlaces += await writeComposition(
        composition,
        composition.name,
        composition.uid,
        null
      );
      result.added.push(composition.name);
    } else if (ownHashes.get(composition.uid) === composition.hash) {
      // the same on both sides already
    } else if (ownHashes.get(composition.uid) === composition.baseHash) {
      result.emptyPlaces += await writeComposition(
        composition,
        composition.name,
        composition.uid,
        own.dataValues.id
      );
      result.updated.push(composition.name);
    } else {
      const name = `${composition.name} (satellite)`;
      result.emptyPlaces += await writeComposition(
        composition,
        name,
        randomUUID(),
        null
      );
      result.keptBoth.push(composition.name);
    }
  }
  // What was deleted on the satellite goes here too, unless it was changed
  // in KweenB since the last sync: then somebody worked on it, and it stays.
  for (const gone of deleted) {
    if (!gone || !gone.uid) continue;
    const own = await InterfaceCompositionDB.findOne({
      where: { uid: gone.uid },
    });
    if (!own) continue;
    if (ownHashes.get(gone.uid) !== gone.baseHash) {
      result.keptDespiteDelete.push(own.dataValues.name);
      continue;
    }
    const transaction = await Database.sequelize.transaction();
    try {
      await InterfaceCompositionBeeDB.destroy({
        where: { interfaceCompositionId: own.dataValues.id },
        transaction,
      });
      await InterfaceCompositionDB.destroy({
        where: { id: own.dataValues.id },
        transaction,
      });
      await transaction.commit();
      result.deleted.push(own.dataValues.name);
    } catch (e) {
      await transaction.rollback();
      throw e;
    }
  }

  return result;
};

// one sync at a time: two at once would write the same tables together
let syncing: Promise<ISatelliteSyncResult> | null = null;

const sync = async (
  host: string,
  port: number
): Promise<ISatelliteSyncResult> => {
  const address = `http://${host}:${port}`;

  let pending: {
    name?: string;
    compositions: SatelliteComposition[];
    // not sent by a satellite of before deletes travelled
    deleted?: DeletedOnSatellite[];
  };
  try {
    pending = await request(`${address}/api/sync/pending`, ASK_TIMEOUT_MS);
  } catch (e) {
    throw new Error(
      "The satellite did not answer. Check that it is switched on and on the same network as this computer."
    );
  }

  const takenOver = await takeOverFromSatellite(
    pending.compositions || [],
    pending.deleted || []
  );

  const data = await buildSyncData();
  try {
    await request(`${address}/api/sync/receive`, SEND_TIMEOUT_MS, data);
  } catch (e) {
    throw new Error(
      "The satellite did not take what KweenB sent. Nothing was lost: try again."
    );
  }

  return {
    satelliteName: pending.name || host,
    ...takenOver,
    sent: {
      bees: data.bees.length,
      scenes: data.audioScenes.length,
      compositions: data.compositions.length,
    },
  };
};

/**
 * Sync with the satellite at this address
 */
const syncWithSatellite = async (
  host: string,
  port: number = DEFAULT_SATELLITE_PORT
): Promise<ISatelliteSyncResult> => {
  if (!/^[A-Za-z0-9.:-]+$/.test(host) || !Number.isInteger(port))
    throw new Error("That is not the address of a satellite.");
  while (syncing) await syncing.catch(() => undefined);
  const thisSync = sync(host, port);
  syncing = thisSync;
  try {
    return await thisSync;
  } finally {
    if (syncing === thisSync) syncing = null;
  }
};

const IPV4 = /^\d+\.\d+\.\d+\.\d+$/;

/**
 * Where something that announced itself can be reached. What it says about
 * itself is not always usable (a satellite that started before its network
 * was up names no address, and gives its name without ".local"), so the
 * address the announcement came from is trusted first.
 */
export const addressToReach = (service: {
  addresses?: string[];
  host?: string;
  referer?: { address?: string };
}): string | null => {
  const cameFrom = service.referer?.address || "";
  if (IPV4.test(cameFrom)) return cameFrom;
  const announced = (service.addresses || []).find((a) => IPV4.test(a));
  if (announced) return announced;
  const host = (service.host || "").replace(/\.$/, "");
  if (!host) return null;
  // a bare name is a name on the local network
  return host.includes(".") ? host : `${host}.local`;
};

/**
 * Look for the satellites on the network. A satellite announces itself; when
 * none did, the usual name of a satellite is tried.
 */
const findSatellites = async (): Promise<ISatellite[]> => {
  const found = new Map<string, ISatellite>();

  await new Promise<void>((resolve) => {
    // without a network there is nothing to find, that is not an error
    const bonjour = new Bonjour(undefined, () => {});
    const browser = bonjour.find({ type: SATELLITE_SERVICE }, (service) => {
      const reachAt = addressToReach(service);
      if (!reachAt) return;
      found.set(`${reachAt}:${service.port}`, {
        name:
          (service.host || "").replace(/\.$/, "").replace(/\.local$/, "") ||
          service.name,
        host: reachAt,
        port: service.port,
      });
    });
    setTimeout(() => {
      try {
        browser.stop();
        bonjour.destroy();
      } catch (e) {
        // already closed
      }
      resolve();
    }, LOOK_FOR_MS);
  });

  if (found.size === 0) {
    try {
      const answer = await request<{ name?: string }>(
        `http://${DEFAULT_SATELLITE_HOST}:${DEFAULT_SATELLITE_PORT}/api/sync/pending`,
        2500
      );
      found.set(DEFAULT_SATELLITE_HOST, {
        name: answer.name || "satellite",
        host: DEFAULT_SATELLITE_HOST,
        port: DEFAULT_SATELLITE_PORT,
      });
    } catch (e) {
      // there is no satellite
    }
  }

  return Array.from(found.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

/**
 * Let the satellite find KweenB: announce it on the network for as long as
 * KweenB is open
 * @returns A function that stops announcing
 */
const announceKweenB = (): (() => void) => {
  try {
    const bonjour = new Bonjour(undefined, () => {});
    const service = bonjour.publish({
      name: `KweenB on ${os.hostname().replace(/\.local$/, "")}`,
      type: KWEENB_SERVICE,
      port: REMOTE_INTERFACE_PORT,
    });
    // another KweenB with the same name on the network is not a problem
    service.on("error", () => {});
    return () => {
      try {
        bonjour.unpublishAll(() => bonjour.destroy());
      } catch (e) {
        // already closed
      }
    };
  } catch (e) {
    return () => {};
  }
};

export default {
  announceKweenB,
  findSatellites,
  syncWithSatellite,
};
