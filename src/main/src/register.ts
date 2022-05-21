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
  saveConfig,
  startJackWithJacktripClient as startJackWithJacktripClientBee,
  hookOnCurrentHive,
} from "./controllers/bee";
import {
  startJackWithJacktripClient as startJackWithJacktripClientKweenB,
  killJackAndJacktrip as killJackAndJacktripOnKweenB,
} from "./controllers/kweenb";
import { KweenBGlobal } from "./kweenb";
import BeesPoller from "./lib/Interval/BeesPoller";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";
import { fetchSettings, updateSetting } from "./controllers/setting";
import BeePoller from "./lib/Interval/BeePoller";
import {
  fetchTheKween,
  isZwerm3ApiRunningOnTheKween,
  killJackAndJacktrip as killJackAndJacktripOnTheKween,
  makeAudioConnections,
  startHubServer,
  validateHive,
} from "./controllers/thekween";
import { subscribe, unsubscribe } from "./controllers/mqtt";

export const registerActions = () => {
  ipcMain.on("hello", hello);
  ipcMain.on("bee:beesPoller", beesPoller);
  ipcMain.on("bee:beePoller", beePoller);
  ipcMain.on("bee:setBeeActive", setBeeActive);
  ipcMain.on("mqtt:subscribe", subscribe);
  ipcMain.on("mqtt:unsubscribe", unsubscribe);
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
  ipcMain.handle("bee:hookOnCurrentHive", hookOnCurrentHive);
  ipcMain.handle("bee:startJack", startJack);
  ipcMain.handle("bee:updateBee", updateBee);
  ipcMain.handle("bee:saveConfig", saveConfig);
  ipcMain.handle(
    "bee:startJackWithJacktripClient",
    startJackWithJacktripClientBee
  );
  ipcMain.handle("kweenb:killJackAndJacktrip", killJackAndJacktripOnKweenB);
  ipcMain.handle(
    "kweenb:startJackWithJacktripClient",
    startJackWithJacktripClientKweenB
  );
  ipcMain.handle("setting:fetchSettings", fetchSettings);
  ipcMain.handle("setting:updateSetting", updateSetting);
  ipcMain.handle("thekween:fetchTheKween", fetchTheKween);
  ipcMain.handle("thekween:killJackAndJacktrip", killJackAndJacktripOnTheKween);
  ipcMain.handle(
    "thekween:isZwerm3ApiRunningOnTheKween",
    isZwerm3ApiRunningOnTheKween
  );
  ipcMain.handle("thekween:startHubServer", startHubServer);
  ipcMain.handle("thekween:makeAudioConnections", makeAudioConnections);
  ipcMain.handle("thekween:validateHive", validateHive);
};

export const registerIntervalWorkers = () => {
  const intervalWorkerList = new IntervalWorkerList();
  intervalWorkerList.addProcess("bee:beesPoller", new BeesPoller());
  intervalWorkerList.addProcess("bee:beePoller", new BeePoller());
  KweenBGlobal.intervalWorkerList = intervalWorkerList;
};
