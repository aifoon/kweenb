/**
 * Monitoring: how the swarm is doing while KweenB runs
 */

import { dialog } from "electron";
import fs from "fs";
import { IMonitorSnapshot } from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
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
