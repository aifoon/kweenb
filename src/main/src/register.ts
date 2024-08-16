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
  makeAudioConnection,
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
  startJacktripHubServer,
  startJackWithJacktripHubClient as startJackWithJacktripHubClientKweenB,
  killJackAndJacktrip as killJackAndJacktripOnKweenB,
  startJackWithJacktripP2PClient as startJackWithJacktripP2PClientKweenB,
  makeP2PAudioConnections as makeP2PAudioConnectionsKweenB,
  makeP2PAudioConnection as makeP2PAudioConnectionKweenB,
  disconnectAllP2PAudioConnections,
  getKweenBVersion,
  makeHubAudioConnections as makeHubAudioConnectionsKweenB,
  setJackFolderPath,
  setJacktripBinPath,
  calculateCurrentLatency,
  isJackAndJacktripInstalled,
  openDialog,
} from "./controllers/kweenb";
import { fetchSettings, updateSetting } from "./controllers/setting";
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

/**
 * Register different method handlers
 */

const methodHandlers = [
  /**
   * Bee
   */

  // CRUD BEES

  { name: "bee:createBee", handler: createBee },
  { name: "bee:deleteBee", handler: deleteBee },
  { name: "bee:updateBee", handler: updateBee },
  { name: "bee:getCurrentBeeStates", handler: getCurrentBeeStates },
  { name: "bee:fetchBee", handler: fetchBee },
  { name: "bee:fetchActiveBees", handler: fetchActiveBees },
  { name: "bee:fetchActiveBeesData", handler: fetchActiveBeesData },
  { name: "bee:fetchAllBees", handler: fetchAllBees },
  { name: "bee:fetchAllBeesData", handler: fetchAllBeesData },
  { name: "bee:fetchInActiveBees", handler: fetchInActiveBees },
  { name: "bee:fetchInActiveBeesData", handler: fetchInActiveBeesData },

  // JACK/JACKTRIP

  { name: "bee:killJackAndJacktrip", handler: killJackAndJacktrip },
  { name: "bee:killJack", handler: killJack },
  { name: "bee:killJacktrip", handler: killJacktrip },
  { name: "bee:makeAudioConnection", handler: makeAudioConnection },
  { name: "bee:startJack", handler: startJack },
  {
    name: "bee:startJackWithJacktripHubClient",
    handler: startJackWithJacktripHubClientBee,
  },
  {
    name: "bee:startJackWithJacktripP2PServer",
    handler: startJackWithJacktripP2PServerBee,
  },
  { name: "bee:startJacktripP2PServer", handler: startJacktripP2PServerBee },

  // CONFIG

  { name: "bee:getBeeConfig", handler: getBeeConfig },
  { name: "bee:saveConfig", handler: saveConfig },

  // AUDIO

  { name: "bee:deleteAudio", handler: deleteAudio },
  { name: "bee:getAudioFiles", handler: getAudioFiles },
  { name: "bee:getAudioScenes", handler: getAudioScenes },
  { name: "bee:killPureData", handler: killPureData },
  { name: "bee:setAudioParam", handler: setAudioParam },
  { name: "bee:setAudioParamForAllBees", handler: setAudioParamForAllBees },
  { name: "bee:startAudio", handler: startAudio },
  { name: "bee:stopAudio", handler: stopAudio },
  { name: "bee:startPureData", handler: startPureData },
  { name: "bee:uploadAudioFiles", handler: uploadAudioFiles },

  /**
   * KweenB
   */

  // APP

  { name: "kweenb:getKweenBVersion", handler: getKweenBVersion },
  { name: "kweenb:openDialog", handler: openDialog },

  // JACK/JACKTRIP

  { name: "kweenb:calculateCurrentLatency", handler: calculateCurrentLatency },
  {
    name: "kweenb:isJackAndJacktripInstalled",
    handler: isJackAndJacktripInstalled,
  },
  { name: "kweenb:killJackAndJacktrip", handler: killJackAndJacktripOnKweenB },
  {
    name: "kweenb:startJacktripHubServer",
    handler: startJacktripHubServer,
  },
  {
    name: "kweenb:startJackWithJacktripHubClient",
    handler: startJackWithJacktripHubClientKweenB,
  },
  {
    name: "kweenb:startJackWithJacktripP2PClient",
    handler: startJackWithJacktripP2PClientKweenB,
  },
  {
    name: "kweenb:makeHubAudioConnections",
    handler: makeHubAudioConnectionsKweenB,
  },
  {
    name: "kweenb:makeP2PAudioConnections",
    handler: makeP2PAudioConnectionsKweenB,
  },
  {
    name: "kweenb:disconnectP2PAudioConnections",
    handler: disconnectAllP2PAudioConnections,
  },
  {
    name: "kweenb:makeAudioConnection",
    handler: makeP2PAudioConnectionKweenB,
  },

  /**
   * Settings
   */

  // CRUD

  { name: "setting:fetchSettings", handler: fetchSettings },
  { name: "setting:updateSetting", handler: updateSetting },

  /**
   * Presets
   */

  { name: "presets:getAudioPresets", handler: getAudioPresets },
  { name: "presets:activatePreset", handler: activatePreset },

  /**
   * Positioning
   */

  {
    name: "positioning:connectPozyxMqttBroker",
    handler: connectPozyxMqttBroker,
  },
  { name: "positioning:getAllTagIds", handler: getAllTagIds },
  {
    name: "positioning:getTargetsAndOptionsForAlgorithm",
    handler: getTargetsAndOptionsForAlgorithm,
  },
];

/**
 * Register the method handlers
 */
export const registerMethodHandlers = () => {
  methodHandlers.forEach(({ name, handler }) => {
    ipcMain.handle(name, handler);
  });
};

/**
 * Remove the method handlers
 */
export const removeMethodHandlers = () => {
  methodHandlers.forEach(({ name }) => {
    ipcMain.removeHandler(name);
  });
};
