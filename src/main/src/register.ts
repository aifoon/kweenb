/**
 * Register different action endpoints
 */

import { ipcMain } from "electron";
import { hello } from "./controllers/hello";
import {
  fetchAllBees,
  beesPoller,
  fetchBee,
  updateBee,
} from "./controllers/bee";
import { KweenBGlobal } from "./kweenb";
import BeesPoller from "./lib/Interval/BeesPoller";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";
import {
  fetchKweenBSettings,
  updateKweenBSetting,
} from "./controllers/setting";

export const registerActions = () => {
  ipcMain.on("hello", hello);
  ipcMain.on("beesPoller", beesPoller);
};

export const registerMethods = () => {
  ipcMain.handle("bee:fetchBee", fetchBee);
  ipcMain.handle("bee:fetchAllBees", fetchAllBees);
  ipcMain.handle("bee:updateBee", updateBee);
  ipcMain.handle("setting:fetchKweenBSettings", fetchKweenBSettings);
  ipcMain.handle("setting:updateKweenBSetting", updateKweenBSetting);
};

export const registerIntervalWorkers = () => {
  const intervalWorkerList = new IntervalWorkerList();
  intervalWorkerList.addProcess("bee:beesPoller", new BeesPoller());
  KweenBGlobal.intervalWorkerList = intervalWorkerList;
};
