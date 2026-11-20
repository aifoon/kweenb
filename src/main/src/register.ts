/**
 * Register different action endpoints
 */

import { ipcMain } from "electron";
import { findSatellites, sendToSatellite } from "./controllers/satellite";
import {
  checkForUpdates,
  downloadKweenB,
  updateDevice,
} from "./controllers/updates";
import {
  fetchAllBees,
  fetchBee,
  updateBee,
  createBee,
  deleteBee,
  setBeeActive,
  killJackAndJacktrip,
  startJackWithJacktripHubClient as startJackWithJacktripHubClientBee,
  startJackWithJacktripP2PServer as startJackWithJacktripP2PServerBee,
  manageBeeDevice,
  setBeePozyxTagId,
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
  getKweenBVersion,
  getRemoteInterface,
  openRemoteInterface,
  makeP2PAudioConnection as makeP2PAudioConnectionKweenB,
  openDialog,
  setJackFolderPath,
  setJacktripBinPath,
  startJackWithJacktripP2PClient as startJackWithJacktripP2PClientKweenB,
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
import {
  adoptFromNetwork,
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
  { name: "bee:fetchBee", handler: fetchBee },
  { name: "bee:fetchAllBees", handler: fetchAllBees },

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
  { name: "satellite:find", handler: findSatellites },
  { name: "satellite:send", handler: sendToSatellite },
  { name: "updates:check", handler: checkForUpdates },
  { name: "updates:updateDevice", handler: updateDevice },
  { name: "updates:downloadKweenB", handler: downloadKweenB },
  { name: "kweenb:getRemoteInterface", handler: getRemoteInterface },
  { name: "kweenb:openRemoteInterface", handler: openRemoteInterface },
  { name: "kweenb:openDialog", handler: openDialog },

  // JACK/JACKTRIP

  { name: "kweenb:calculateCurrentLatency", handler: calculateCurrentLatency },
  {
    name: "kweenb:startJackWithJacktripP2PClient",
    handler: startJackWithJacktripP2PClientKweenB,
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
  { name: "speaker:adoptFromNetwork", handler: adoptFromNetwork },

  // FLASHING A SPEAKER

  { name: "speaker:chooseFlashImage", handler: chooseFlashImage },
  { name: "speaker:getLastFlashImage", handler: getLastFlashImage },
  { name: "speaker:findSpeakerToFlash", handler: findSpeakerToFlash },
  { name: "speaker:flashSpeaker", handler: flashSpeaker },

  // SOUND DEVICE AND ROUTING

  { name: "routing:get", handler: getRouting },
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
