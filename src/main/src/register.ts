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
  startJackWithJacktripHubClient as startJackWithJacktripHubClientBee,
  startJackWithJacktripP2PServer as startJackWithJacktripP2PServerBee,
  hookOnCurrentHive,
  makeP2PAudioConnection as makeP2PAudioConnectionBee,
  setBeePozyxTagId,
  getBeeConfig,
  getCurrentBeeStates,
} from "./controllers/bee";
import {
  startJackWithJacktripHubClient as startJackWithJacktripHubClientKweenB,
  killJackAndJacktrip as killJackAndJacktripOnKweenB,
  startJackWithJacktripP2PClient as startJackWithJacktripP2PClientKweenB,
  makeP2PAudioConnections as makeP2PAudioConnectionsKweenB,
  makeP2PAudioConnection as makeP2PAudioConnectionKweenB,
  disconnectAllP2PAudioConnections,
  getKweenBVersion,
  setJackFolderPath,
  setJacktripBinPath,
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
  makeHubAudioConnections,
  startHubServer,
  validateHive,
} from "./controllers/thekween";
import {
  connectPozyxMqttBroker,
  disconnectPozyxMqttBroker,
  enablePositioningControllerAlgorithm,
  enablePositioningControllerTargetType,
  getAllTagIds,
  getTargetsAndOptionsForAlgorithm,
  updatePositioningControllerAlgorithmOptions,
} from "./controllers/positioning";

export const registerActions = () => {
  ipcMain.on("hello", hello);
  ipcMain.on("bee:beesPoller", beesPoller);
  ipcMain.on("bee:beePoller", beePoller);
  ipcMain.on("bee:setBeeActive", setBeeActive);
  ipcMain.on("bee:setBeePozyxTagId", setBeePozyxTagId);
  ipcMain.on("kweenb:setJackFolderPath", setJackFolderPath);
  ipcMain.on("kweenb:setJacktripBinPath", setJacktripBinPath);
  ipcMain.on(
    "positioning:disconnectPozyxMqttBroker",
    disconnectPozyxMqttBroker
  );
  ipcMain.on(
    "positioning:enablePositioningControllerTargetType",
    enablePositioningControllerTargetType
  );
  ipcMain.on(
    "positioning:enablePositioningControllerAlgorithm",
    enablePositioningControllerAlgorithm
  );
  ipcMain.on(
    "positioning:updatePositioningControllerAlgorithmOptions",
    updatePositioningControllerAlgorithmOptions
  );
};

export const registerMethods = () => {
  /**
   * Bee
   */

  // CRUD BEE
  ipcMain.handle("bee:createBee", createBee);
  ipcMain.handle("bee:deleteBee", deleteBee);
  ipcMain.handle("bee:updateBee", updateBee);
  ipcMain.handle("bee:getCurrentBeeStates", getCurrentBeeStates);
  ipcMain.handle("bee:fetchBee", fetchBee);
  ipcMain.handle("bee:fetchActiveBees", fetchActiveBees);
  ipcMain.handle("bee:fetchActiveBeesData", fetchActiveBeesData);
  ipcMain.handle("bee:fetchAllBees", fetchAllBees);
  ipcMain.handle("bee:fetchAllBeesData", fetchAllBeesData);
  ipcMain.handle("bee:fetchInActiveBees", fetchInActiveBees);
  ipcMain.handle("bee:fetchInActiveBeesData", fetchInActiveBeesData);

  // JACK/JACKTRIP
  ipcMain.handle("bee:killJackAndJacktrip", killJackAndJacktrip);
  ipcMain.handle("bee:killJack", killJack);
  ipcMain.handle("bee:killJacktrip", killJacktrip);
  ipcMain.handle("bee:hookOnCurrentHive", hookOnCurrentHive);
  ipcMain.handle("bee:makeP2PAudioConnection", makeP2PAudioConnectionBee);
  ipcMain.handle("bee:startJack", startJack);
  ipcMain.handle(
    "bee:startJackWithJacktripHubClient",
    startJackWithJacktripHubClientBee
  );
  ipcMain.handle(
    "bee:startJackWithJacktripP2PServer",
    startJackWithJacktripP2PServerBee
  );

  // CONFIG
  ipcMain.handle("bee:getBeeConfig", getBeeConfig);
  ipcMain.handle("bee:saveConfig", saveConfig);

  /**
   * KweenB
   */

  // VERSION
  ipcMain.handle("kweenb:getKweenBVersion", getKweenBVersion);

  // JACK/JACKTRIP
  ipcMain.handle("kweenb:killJackAndJacktrip", killJackAndJacktripOnKweenB);
  ipcMain.handle(
    "kweenb:startJackWithJacktripHubClient",
    startJackWithJacktripHubClientKweenB
  );
  ipcMain.handle(
    "kweenb:startJackWithJacktripP2PClient",
    startJackWithJacktripP2PClientKweenB
  );
  ipcMain.handle(
    "kweenb:makeP2PAudioConnections",
    makeP2PAudioConnectionsKweenB
  );
  ipcMain.handle(
    "kweenb:disconnectP2PAudioConnections",
    disconnectAllP2PAudioConnections
  );
  ipcMain.handle("kweenb:makeP2PAudioConnection", makeP2PAudioConnectionKweenB);

  /**
   * Settings
   */

  // CRUD
  ipcMain.handle("setting:fetchSettings", fetchSettings);
  ipcMain.handle("setting:updateSetting", updateSetting);

  /**
   * The Kween
   */

  // JACK/JACKTRIP
  ipcMain.handle("thekween:killJackAndJacktrip", killJackAndJacktripOnTheKween);
  ipcMain.handle("thekween:startHubServer", startHubServer);
  ipcMain.handle("thekween:makeHubAudioConnections", makeHubAudioConnections);
  ipcMain.handle("thekween:validateHive", validateHive);

  ipcMain.handle("thekween:fetchTheKween", fetchTheKween);
  ipcMain.handle(
    "thekween:isZwerm3ApiRunningOnTheKween",
    isZwerm3ApiRunningOnTheKween
  );

  /**
   * Positioning
   */
  ipcMain.handle("positioning:connectPozyxMqttBroker", connectPozyxMqttBroker);
  ipcMain.handle("positioning:getAllTagIds", getAllTagIds);
  ipcMain.handle(
    "positioning:getTargetsAndOptionsForAlgorithm",
    getTargetsAndOptionsForAlgorithm
  );
};

export const registerIntervalWorkers = () => {
  const intervalWorkerList = new IntervalWorkerList();
  intervalWorkerList.addProcess("bee:beesPoller", new BeesPoller());
  intervalWorkerList.addProcess("bee:beePoller", new BeePoller());
  KweenBGlobal.intervalWorkerList = intervalWorkerList;
};
