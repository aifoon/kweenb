/**
 * Register different action endpoints
 */

import { ipcMain } from "electron";
import { hello } from "./controllers/hello";
import {
  fetchAllBees,
  fetchBee,
  updateBee,
  createBee,
  deleteBee,
  setBeeActive,
  fetchInActiveBees,
  fetchActiveBees,
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
  setAudioParam,
  setAudioParamForAllBees,
  startAudio,
  stopAudio,
  startPureData,
  killPureData,
  getAudioFiles,
  deleteAudio,
  uploadAudioFiles,
  startJacktripP2PServer as startJacktripP2PServerBee,
  getAudioScenes,
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
  calculateCurrentLatency,
  isJackAndJacktripInstalled,
  openDialog,
} from "./controllers/kweenb";
import { fetchSettings, updateSetting } from "./controllers/setting";
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
import { activatePreset, getAudioPresets } from "./controllers/presets";

export const registerActions = () => {
  ipcMain.on("hello", hello);
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
  ipcMain.handle("bee:startJacktripP2PServer", startJacktripP2PServerBee);

  // CONFIG
  ipcMain.handle("bee:getBeeConfig", getBeeConfig);
  ipcMain.handle("bee:saveConfig", saveConfig);

  // AUDIO
  ipcMain.handle("bee:deleteAudio", deleteAudio);
  ipcMain.handle("bee:getAudioFiles", getAudioFiles);
  ipcMain.handle("bee:getAudioScenes", getAudioScenes);
  ipcMain.handle("bee:killPureData", killPureData);
  ipcMain.handle("bee:setAudioParam", setAudioParam);
  ipcMain.handle("bee:setAudioParamForAllBees", setAudioParamForAllBees);
  ipcMain.handle("bee:startAudio", startAudio);
  ipcMain.handle("bee:stopAudio", stopAudio);
  ipcMain.handle("bee:startPureData", startPureData);
  ipcMain.handle("bee:uploadAudioFiles", uploadAudioFiles);

  /**
   * KweenB
   */

  // APP
  ipcMain.handle("kweenb:getKweenBVersion", getKweenBVersion);
  ipcMain.handle("kweenb:openDialog", openDialog);

  // JACK/JACKTRIP
  ipcMain.handle("kweenb:calculateCurrentLatency", calculateCurrentLatency);
  ipcMain.handle(
    "kweenb:isJackAndJacktripInstalled",
    isJackAndJacktripInstalled
  );
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
   * Presets
   */

  ipcMain.handle("presets:getAudioPresets", getAudioPresets);
  ipcMain.handle("presets:activatePreset", activatePreset);

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
