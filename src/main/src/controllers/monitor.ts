/**
 * Monitoring: how the swarm is doing while KweenB runs
 */

import { app, dialog } from "electron";
import fs from "fs";
import { IMonitorSnapshot } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import SpeakerApi from "../lib/KweenB/SpeakerApi";
import SwarmMonitor from "../lib/KweenB/SwarmMonitor";

const monitor = (): SwarmMonitor => {
  const { beeStatesWorker } = KweenBGlobal.kweenb;
  // every bee is listed, also the ones that were never heard
  beeStatesWorker.beeStates.bees.forEach((bee) =>
    beeStatesWorker.monitor.know(bee.id, bee.name)
  );
  return beeStatesWorker.monitor;
};

/**
 * How the swarm is doing right now
 */
export const getMonitoring = async (): Promise<IMonitorSnapshot> =>
  monitor().snapshot();

/**
 * Start counting again
 */
export const clearMonitoring = async (): Promise<IMonitorSnapshot> => {
  monitor().clear();
  return monitor().snapshot();
};

/**
 * Save what happened as a text file
 * @returns true when the file was saved
 */
export const saveMonitoringLog = async (): Promise<boolean> => {
  const now = new Date();
  const two = (n: number) => String(n).padStart(2, "0");
  const { canceled, filePath } = await dialog.showSaveDialog(
    KweenBGlobal.kweenb.mainWindow,
    {
      title: "Save the monitoring log",
      defaultPath: `kweenb-monitoring-${now.getFullYear()}-${two(
        now.getMonth() + 1
      )}-${two(now.getDate())}-${two(now.getHours())}${two(
        now.getMinutes()
      )}.txt`,
      filters: [{ name: "Text", extensions: ["txt"] }],
    }
  );
  if (canceled || !filePath) return false;
  await fs.promises.writeFile(filePath, monitor().logText(), "utf8");
  return true;
};

/**
 * Live meters: the level of bees about ten times a second. Every level is
 * a packet on the Wi-Fi, so a bee is only followed while someone looks at
 * its meter: the bee whose dashboard is open, or all bees while the live
 * meters on the Swarm page are switched on.
 */

type LevelOwner = "dashboard" | "swarm";

// who wants the level of which bees
const wantedLevels: Record<LevelOwner, number[]> = { dashboard: [], swarm: [] };

// the bees that are followed, with the way to stop following them
const levelFollowers = new Map<number, () => void>();

// the levels that came in since they were last sent to the page
let newLevels: Record<number, number> = {};
let levelsTimer: NodeJS.Timeout | null = null;

const sendNewLevels = () => {
  const { mainWindow } = KweenBGlobal.kweenb;
  if (Object.keys(newLevels).length === 0 || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("bee-levels", newLevels);
  newLevels = {};
};

const followLevelOf = (beeId: number): (() => void) | null => {
  const bee = KweenBGlobal.kweenb.beeStates.bees.find((b) => b.id === beeId);
  if (!bee) return null;
  const note = (levelDb: number) => {
    newLevels[beeId] = levelDb;
  };

  return SpeakerApi.followLevel(bee.ipAddress, note);
};

/**
 * Tell which bees a part of KweenB wants the live level of
 * @param owner The part of KweenB that asks
 * @param beeIds Its bees; an empty list when it wants none any more
 */
export const followBeeLevels = (
  event: Electron.IpcMainEvent | null,
  owner: LevelOwner,
  beeIds: number[]
) => {
  if (owner !== "dashboard" && owner !== "swarm") return;
  wantedLevels[owner] = Array.isArray(beeIds)
    ? beeIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
    : [];
  const wanted = new Set([...wantedLevels.dashboard, ...wantedLevels.swarm]);

  // stop following the bees nobody looks at any more
  levelFollowers.forEach((stop, beeId) => {
    if (wanted.has(beeId)) return;
    stop();
    levelFollowers.delete(beeId);
  });
  // start following the new ones
  wanted.forEach((beeId) => {
    if (levelFollowers.has(beeId)) return;
    const stop = followLevelOf(beeId);
    if (stop) levelFollowers.set(beeId, stop);
  });

  // the levels go to the page together, ten times a second
  if (levelFollowers.size > 0 && !levelsTimer)
    levelsTimer = setInterval(sendNewLevels, 100);
  if (levelFollowers.size === 0 && levelsTimer) {
    clearInterval(levelsTimer);
    levelsTimer = null;
    newLevels = {};
  }
};

// nothing keeps running when KweenB closes
app.on("before-quit", () => {
  followBeeLevels(null, "dashboard", []);
  followBeeLevels(null, "swarm", []);
});
