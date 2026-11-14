import { ipcRenderer } from "electron";
import {
  IAdoptSpeakerRequest,
  IAdoptSpeakerResult,
  IFoundSpeaker,
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

export default {
  ...newSpeakers,
  ...sounds,
};
