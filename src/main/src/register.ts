/**
 * Register different action endpoints
 */

import { ipcMain } from "electron";
import {
  fetchAllBees,
  fetchBee,
  updateBee,
  createBee,
  deleteBee,
  setBeeActive,
  fetchInActiveBees,
  fetchActiveBees,
  killJackAndJacktrip,
  fetchAllBeesData,
  fetchActiveBeesData,
  fetchInActiveBeesData,
  flushAudioScenes,
  startJackWithJacktripHubClient as startJackWithJacktripHubClientBee,
  startJackWithJacktripP2PServer as startJackWithJacktripP2PServerBee,
  manageBeeDevice,
  setBeePozyxTagId,
  getCurrentBeeStates,
  setAudioParam,
  setAudioParamForAllBees,
  startAudio,
  stopAudio,
  getAudioFiles,
  deleteAudio,
  uploadAudioFiles,
  getAudioScenes,
  cancelUploadAudioFiles,
  pauseUpdateAudioScenes,
} from "./controllers/bee";
import {
  calculateCurrentLatency,
  closeKweenB,
  disconnectAllP2PAudioConnections,
  getKweenBVersion,
  isJackAndJacktripInstalled,
  killJackAndJacktrip as killJackAndJacktripOnKweenB,
  makeHubAudioConnections as makeHubAudioConnectionsKweenB,
  makeP2PAudioConnection as makeP2PAudioConnectionKweenB,
  makeP2PAudioConnections as makeP2PAudioConnectionsKweenB,
  openDialog,
  setJackFolderPath,
  setJacktripBinPath,
  startJackWithJacktripHubClient as startJackWithJacktripHubClientKweenB,
  startJackWithJacktripP2PClient as startJackWithJacktripP2PClientKweenB,
  startJacktripHubServer,
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
import {
  adoptSpeaker,
  cancelSounds,
  findNewSpeakers,
  getSoundBackups,
  restoreSounds,
  saveSounds,
  stopLookingForSpeakers,
} from "./controllers/speaker";
import {
  cancelFlash,
  chooseFlashImage,
  findSpeakerToFlash,
  flashSpeaker,
  getLastFlashImage,
} from "./controllers/flash";
import {
  clearMonitoring,
  followBeeLevels,
  getMonitoring,
  saveMonitoringLog,
} from "./controllers/monitor";
import {
  activateBackupKey,
  backUpSwarm,
  chooseBackupKey,
  saveBackupKey,
  cancelCloud,
  getCloudBackupState,
  getCloudSettings,
  getCloudSoundSets,
  restoreSoundsFromCloud,
  getSoundsFromCloud,
  saveCloudSettings,
  sendSoundsToCloud,
} from "./controllers/cloud-backup";
import {
  getRouting,
  getSoundDevice,
  getSoundDeviceChoices,
  installKweenBSoundDevice,
  setBeeChannel,
  setBeeChannels,
  startLevels,
  stopLevels,
} from "./controllers/sound-device";
import {
  startDisconnectStreaming,
  startHubStreaming,
  startP2PStreaming,
  startTriggerOnlyStreaming,
} from "./controllers/streaming";

/**
 * Register the actions
 */

const actionListeners = [
  { name: "bee:flushAudioScenes", listener: flushAudioScenes },
  { name: "bee:pauseUpdateAudioScenes", listener: pauseUpdateAudioScenes },
  { name: "bee:setBeeActive", listener: setBeeActive },
  { name: "bee:setBeePozyxTagId", listener: setBeePozyxTagId },
  { name: "bee:cancelUploadAudioFiles", listener: cancelUploadAudioFiles },
  { name: "kweenb:closeKweenB", listener: closeKweenB },
  { name: "kweenb:setJackFolderPath", listener: setJackFolderPath },
  { name: "kweenb:setJacktripBinPath", listener: setJacktripBinPath },
  { name: "speaker:cancelFlash", listener: cancelFlash },
  { name: "cloud:cancel", listener: cancelCloud },
  { name: "monitor:followBeeLevels", listener: followBeeLevels },
  { name: "routing:startLevels", listener: startLevels },
  { name: "routing:stopLevels", listener: stopLevels },
  { name: "speaker:cancelSounds", listener: cancelSounds },
  {
    name: "speaker:stopLookingForSpeakers",
    listener: stopLookingForSpeakers,
  },
  {
    name: "positioning:disconnectPozyxMqttBroker",
    listener: disconnectPozyxMqttBroker,
  },
  {
    name: "positioning:enablePositioningControllerTargetType",
    listener: enablePositioningControllerTargetType,
  },
  {
    name: "positioning:enablePositioningControllerAlgorithm",
    listener: enablePositioningControllerAlgorithm,
  },
  {
    name: "positioning:updatePositioningControllerAlgorithmOptions",
    listener: updatePositioningControllerAlgorithmOptions,
  },
];

export const registerActionListeners = () => {
  actionListeners.forEach(({ name, listener }) => {
    ipcMain.on(name, listener);
  });
};

export const removeActionListeners = () => {
  actionListeners.forEach(({ name, listener }) => {
    ipcMain.removeListener(name, listener);
  });
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
  {
    name: "bee:startJackWithJacktripHubClient",
    handler: startJackWithJacktripHubClientBee,
  },
  {
    name: "bee:startJackWithJacktripP2PServer",
    handler: startJackWithJacktripP2PServerBee,
  },

  // AUDIO

  { name: "bee:deleteAudio", handler: deleteAudio },
  { name: "bee:getAudioFiles", handler: getAudioFiles },
  { name: "bee:getAudioScenes", handler: getAudioScenes },
  { name: "bee:setAudioParam", handler: setAudioParam },
  { name: "bee:setAudioParamForAllBees", handler: setAudioParamForAllBees },
  { name: "bee:startAudio", handler: startAudio },
  { name: "bee:stopAudio", handler: stopAudio },
  { name: "bee:uploadAudioFiles", handler: uploadAudioFiles },

  // DEVICES
  { name: "bee:manageBeeDevice", handler: manageBeeDevice },

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
    name: "kweenb:makeP2PAudioConnection",
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

  /**
   * Speakers
   */

  // NEW SPEAKERS

  { name: "speaker:findNewSpeakers", handler: findNewSpeakers },
  { name: "speaker:adoptSpeaker", handler: adoptSpeaker },

  // FLASHING A SPEAKER

  { name: "speaker:chooseFlashImage", handler: chooseFlashImage },
  { name: "speaker:getLastFlashImage", handler: getLastFlashImage },
  { name: "speaker:findSpeakerToFlash", handler: findSpeakerToFlash },
  { name: "speaker:flashSpeaker", handler: flashSpeaker },

  // SOUND DEVICE AND ROUTING

  { name: "routing:get", handler: getRouting },
  { name: "routing:setBeeChannel", handler: setBeeChannel },
  { name: "routing:setBeeChannels", handler: setBeeChannels },
  { name: "soundDevice:get", handler: getSoundDevice },
  { name: "soundDevice:choices", handler: getSoundDeviceChoices },
  { name: "soundDevice:install", handler: installKweenBSoundDevice },

  // CLOUD BACKUP

  { name: "cloud:getSettings", handler: getCloudSettings },
  { name: "cloud:chooseKey", handler: chooseBackupKey },
  { name: "cloud:activateKey", handler: activateBackupKey },
  { name: "cloud:saveKey", handler: saveBackupKey },
  { name: "cloud:saveSettings", handler: saveCloudSettings },
  { name: "cloud:getState", handler: getCloudBackupState },
  { name: "cloud:backUpSwarm", handler: backUpSwarm },
  { name: "cloud:get", handler: getSoundsFromCloud },
  { name: "cloud:send", handler: sendSoundsToCloud },
  { name: "cloud:getSoundSets", handler: getCloudSoundSets },
  { name: "cloud:restoreSounds", handler: restoreSoundsFromCloud },

  // MONITORING

  { name: "monitor:get", handler: getMonitoring },
  { name: "monitor:clear", handler: clearMonitoring },
  { name: "monitor:saveLog", handler: saveMonitoringLog },

  // SOUNDS ON THIS COMPUTER

  { name: "speaker:getSoundBackups", handler: getSoundBackups },
  { name: "speaker:saveSounds", handler: saveSounds },
  {
    name: "speaker:restoreSounds",
    // only what the page may decide gets through
    handler: (
      event: Electron.IpcMainInvokeEvent,
      beeId: number,
      backupName: string,
      exact: boolean
    ) => restoreSounds(event, beeId, backupName, exact === true),
  },

  /**
   * Streaming
   */

  {
    name: "streaming:startHubStreaming",
    handler: startHubStreaming,
  },
  {
    name: "streaming:startP2PStreaming",
    handler: startP2PStreaming,
  },
  {
    name: "streaming:startDisconnectStreaming",
    handler: startDisconnectStreaming,
  },
  {
    name: "streaming:startTriggerOnlyStreaming",
    handler: startTriggerOnlyStreaming,
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
