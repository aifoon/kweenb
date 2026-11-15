import { ipcRenderer } from "electron";
import {
  IAdoptFromNetworkResult,
  IAdoptSpeakerRequest,
  IAdoptSpeakerResult,
  IBackupKeyResult,
  ICloudBackupState,
  ICloudSettings,
  ICloudSettingsInput,
  ICloudTransferResult,
  IFlashImage,
  IFlashSpeakerResult,
  IFlashStorageResult,
  IFoundSpeaker,
  IMonitorSnapshot,
  IRouting,
  IRoutingChange,
  ISoundDeviceChoice,
  ISoundDeviceInfo,
  SoundDeviceInstallOutcome,
  IRestoreSoundsResult,
  ISaveSoundsResult,
  ISoundBackup,
  ISwarmBackupResult,
} from "@shared/interfaces";

/**
 * All methods for new speakers
 */
const newSpeakers = {
  adoptFromNetwork: (): Promise<IAdoptFromNetworkResult> =>
    ipcRenderer.invoke("speaker:adoptFromNetwork"),
  adoptSpeaker: (request: IAdoptSpeakerRequest): Promise<IAdoptSpeakerResult> =>
    ipcRenderer.invoke("speaker:adoptSpeaker", request),
  findNewSpeakers: (): Promise<IFoundSpeaker[]> =>
    ipcRenderer.invoke("speaker:findNewSpeakers"),
};

/**
 * All methods for flashing a speaker
 */
const flashing = {
  chooseFlashImage: (): Promise<IFlashImage | null> =>
    ipcRenderer.invoke("speaker:chooseFlashImage"),
  findSpeakerToFlash: (): Promise<IFlashStorageResult> =>
    ipcRenderer.invoke("speaker:findSpeakerToFlash"),
  flashSpeaker: (imagePath: string): Promise<IFlashSpeakerResult> =>
    ipcRenderer.invoke("speaker:flashSpeaker", imagePath),
  getLastFlashImage: (): Promise<IFlashImage | null> =>
    ipcRenderer.invoke("speaker:getLastFlashImage"),
};

/**
 * All methods for the sounds that are saved on this computer
 */
const sounds = {
  getSoundBackups: (): Promise<ISoundBackup[]> =>
    ipcRenderer.invoke("speaker:getSoundBackups"),
  restoreSounds: (
    beeId: number,
    backupName: string,
    exact: boolean = false
  ): Promise<IRestoreSoundsResult> =>
    ipcRenderer.invoke("speaker:restoreSounds", beeId, backupName, exact),
  saveSounds: (beeIds?: number[]): Promise<ISaveSoundsResult> =>
    ipcRenderer.invoke("speaker:saveSounds", beeIds),
};

/**
 * All methods for monitoring the swarm
 */
const monitoring = {
  clearMonitoring: (): Promise<IMonitorSnapshot> =>
    ipcRenderer.invoke("monitor:clear"),
  getMonitoring: (): Promise<IMonitorSnapshot> =>
    ipcRenderer.invoke("monitor:get"),
  saveMonitoringLog: (): Promise<boolean> =>
    ipcRenderer.invoke("monitor:saveLog"),
};

/**
 * All methods for KweenB's sound device and the routing of its channels
 */
const routing = {
  getRouting: (): Promise<IRouting> => ipcRenderer.invoke("routing:get"),
  getSoundDeviceChoices: (): Promise<ISoundDeviceChoice[]> =>
    ipcRenderer.invoke("soundDevice:choices"),
  getSoundDevice: (): Promise<ISoundDeviceInfo> =>
    ipcRenderer.invoke("soundDevice:get"),
  installSoundDevice: (): Promise<
    ISoundDeviceInfo & { outcome: SoundDeviceInstallOutcome }
  > => ipcRenderer.invoke("soundDevice:install"),
  setBeeChannels: (changes: IRoutingChange[]): Promise<IRouting> =>
    ipcRenderer.invoke("routing:setBeeChannels", changes),
};

/**
 * All methods for the copy of the saved sounds in the cloud
 */
const cloud = {
  activateBackupKey: (passphrase: string): Promise<IBackupKeyResult> =>
    ipcRenderer.invoke("cloud:activateKey", passphrase),
  chooseBackupKey: (): Promise<IBackupKeyResult | null> =>
    ipcRenderer.invoke("cloud:chooseKey"),
  saveBackupKey: (passphrase: string): Promise<IBackupKeyResult> =>
    ipcRenderer.invoke("cloud:saveKey", passphrase),
  getCloudBackupState: (): Promise<ICloudBackupState> =>
    ipcRenderer.invoke("cloud:getState"),
  getCloudSettings: (): Promise<ICloudSettings> =>
    ipcRenderer.invoke("cloud:getSettings"),
  getCloudSoundSets: (): Promise<ISoundBackup[]> =>
    ipcRenderer.invoke("cloud:getSoundSets"),
  restoreSoundsFromCloud: (
    beeId: number,
    backupName: string,
    exact: boolean
  ): Promise<IRestoreSoundsResult> =>
    ipcRenderer.invoke("cloud:restoreSounds", beeId, backupName, exact),
  sendSoundsToCloud: (): Promise<ICloudTransferResult> =>
    ipcRenderer.invoke("cloud:send"),
  getSoundsFromCloud: (): Promise<ICloudTransferResult> =>
    ipcRenderer.invoke("cloud:get"),
  saveCloudSettings: (
    input: ICloudSettingsInput
  ): Promise<ICloudSettings & { message?: string }> =>
    ipcRenderer.invoke("cloud:saveSettings", input),
  backUpSwarmToCloud: (): Promise<ISwarmBackupResult> =>
    ipcRenderer.invoke("cloud:backUpSwarm"),
};

export default {
  ...cloud,
  ...flashing,
  ...routing,
  ...monitoring,
  ...newSpeakers,
  ...sounds,
};
