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
} from "./controllers/kweenb";
import { KweenBGlobal } from "./kweenb";
import BeesPoller from "./lib/Interval/BeesPoller";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";

export const registerActions = () => {
  ipcMain.on("hello", hello);
  ipcMain.on("beesPoller", beesPoller);
};

export const registerMethods = () => {
  ipcMain.handle("kweenb:fetchBee", fetchBee);
  ipcMain.handle("kweenb:fetchAllBees", fetchAllBees);
  ipcMain.handle("kweenb:updateBee", updateBee);
};

export const registerIntervalWorkers = () => {
  const intervalWorkerList = new IntervalWorkerList();
  intervalWorkerList.addProcess("beesPoller", new BeesPoller());
  KweenBGlobal.intervalWorkerList = intervalWorkerList;
};
