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
  createBee,
  deleteBee,
  setBeeActive,
  fetchInActiveBees,
  fetchActiveBees,
  beePoller,
  startJack,
  killJackAndJacktrip,
  killJack,
  killJacktrip,
  fetchAllBeesData,
  fetchActiveBeesData,
  fetchInActiveBeesData,
} from "./controllers/bee";
import { KweenBGlobal } from "./kweenb";
import BeesPoller from "./lib/Interval/BeesPoller";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";
import {
  fetchKweenBSettings,
  updateKweenBSetting,
} from "./controllers/setting";
import BeePoller from "./lib/Interval/BeePoller";
import { fetchTheKween } from "./controllers/thekween";

export const registerActions = () => {
  ipcMain.on("hello", hello);
  ipcMain.on("bee:beesPoller", beesPoller);
  ipcMain.on("bee:beePoller", beePoller);
  ipcMain.on("bee:setBeeActive", setBeeActive);
};

export const registerMethods = () => {
  ipcMain.handle("bee:createBee", createBee);
  ipcMain.handle("bee:deleteBee", deleteBee);
  ipcMain.handle("bee:fetchBee", fetchBee);
  ipcMain.handle("bee:fetchActiveBees", fetchActiveBees);
  ipcMain.handle("bee:fetchActiveBeesData", fetchActiveBeesData);
  ipcMain.handle("bee:fetchAllBees", fetchAllBees);
  ipcMain.handle("bee:fetchAllBeesData", fetchAllBeesData);
  ipcMain.handle("bee:fetchInActiveBees", fetchInActiveBees);
  ipcMain.handle("bee:fetchInActiveBeesData", fetchInActiveBeesData);
  ipcMain.handle("bee:killJackAndJacktrip", killJackAndJacktrip);
  ipcMain.handle("bee:killJack", killJack);
  ipcMain.handle("bee:killJacktrip", killJacktrip);
  ipcMain.handle("bee:startJack", startJack);
  ipcMain.handle("bee:updateBee", updateBee);
  ipcMain.handle("setting:fetchKweenBSettings", fetchKweenBSettings);
  ipcMain.handle("setting:updateKweenBSetting", updateKweenBSetting);
  ipcMain.handle("thekween:fetchTheKween", fetchTheKween);
};

export const registerIntervalWorkers = () => {
  const intervalWorkerList = new IntervalWorkerList();
  intervalWorkerList.addProcess("bee:beesPoller", new BeesPoller());
  intervalWorkerList.addProcess("bee:beePoller", new BeePoller());
  KweenBGlobal.intervalWorkerList = intervalWorkerList;
};
