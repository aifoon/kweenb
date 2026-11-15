import { ipcRenderer } from "electron";
import {
  IAdoptSpeakerRequest,
  IAdoptSpeakerResult,
  IFlashImage,
  IFlashSpeakerResult,
  IFlashStorageResult,
  IFoundSpeaker,
  IMonitorSnapshot,
  IRestoreSoundsResult,
  ISaveSoundsResult,
  ISoundBackup,
} from "@shared/interfaces";

/**
 * All methods for new speakers
 */
const newSpeakers = {
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
    backupName: string
  ): Promise<IRestoreSoundsResult> =>
    ipcRenderer.invoke("speaker:restoreSounds", beeId, backupName),
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

export default {
  ...flashing,
  ...monitoring,
  ...newSpeakers,
  ...sounds,
};
