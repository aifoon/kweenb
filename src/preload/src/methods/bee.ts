import { ipcRenderer } from "electron";
import {
  AudioFile,
  AudioScene,
  IBee,
  IBeeInput,
  IBeeState,
} from "@shared/interfaces";
import { BeeDeviceManagerActions, PDAudioParam } from "@shared/enums";

/**
 * All the audio settings for the bee (eg. triggering)
 */
const audio = {
  deleteAudio: (
    bee: IBee,
    path: string,
    deleteOnAllBees: boolean = false
  ): Promise<void> =>
    ipcRenderer.invoke("bee:deleteAudio", bee, path, deleteOnAllBees),
  getAudioFiles: (bee: IBee): Promise<AudioFile[]> =>
    ipcRenderer.invoke("bee:getAudioFiles", bee),
  getAudioScenes: (): Promise<AudioScene[]> =>
    ipcRenderer.invoke("bee:getAudioScenes"),
  setAudioParam: (
    bees: IBee[] | IBee,
    pdAudioParam: PDAudioParam,
    value: number | boolean
  ) => ipcRenderer.invoke("bee:setAudioParam", bees, pdAudioParam, value),
  setAudioParamForAllBees: (
    pdAudioParam: PDAudioParam,
    value: number | boolean
  ) => ipcRenderer.invoke("bee:setAudioParamForAllBees", pdAudioParam, value),
  startAudio: (bees: IBee[] | IBee, value: string) =>
    ipcRenderer.invoke("bee:startAudio", bees, value),
  stopAudio: (bees: IBee[] | IBee) => ipcRenderer.invoke("bee:stopAudio", bees),
  uploadAudioFiles: (name: string, path: string) =>
    ipcRenderer.invoke("bee:uploadAudioFiles", name, path),
};

/**
 * All CRUD methods for the Bee
 */
const crudBee = {
  createBee: (bee: IBeeInput): Promise<IBee> =>
    ipcRenderer.invoke("bee:createBee", bee),
  deleteBee: (id: number) => {
    ipcRenderer.invoke("bee:deleteBee", id);
  },
  updateBee: (bee: Partial<IBee>) => ipcRenderer.invoke("bee:updateBee", bee),
  getCurrentBeeStates: (bees: IBee[]): Promise<IBeeState[]> =>
    ipcRenderer.invoke("bee:getCurrentBeeStates", bees),
  fetchBee: (id: number): Promise<IBee> =>
    ipcRenderer.invoke("bee:fetchBee", id),
  fetchActiveBees: (): Promise<IBee[]> =>
    ipcRenderer.invoke("bee:fetchActiveBees"),
  fetchActiveBeesData: (): Promise<IBee[]> =>
    ipcRenderer.invoke("bee:fetchActiveBeesData"),
  fetchAllBees: (): Promise<IBee[]> => ipcRenderer.invoke("bee:fetchAllBees"),
  fetchAllBeesData: (): Promise<IBee[]> =>
    ipcRenderer.invoke("bee:fetchAllBeesData"),
  fetchInActiveBees: (): Promise<IBee[]> =>
    ipcRenderer.invoke("bee:fetchInActiveBees"),
  fetchInActiveBeesData: (): Promise<IBee[]> =>
    ipcRenderer.invoke("bee:fetchInActiveBeesData"),
};

/**
 * All methods for the bee with JACK/JACKTRIP
 */
const jackJacktripBee = {
  killJackAndJacktrip: (bee: IBee) =>
    ipcRenderer.invoke("bee:killJackAndJacktrip", bee),
  startJackWithJacktripHubClientBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJackWithJacktripHubClient", bee),
  startJackWithJacktripP2PServerBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJackWithJacktripP2PServer", bee),
};

/**
 * All for managing the bee
 */

const manageBeeDevice = {
  manageBeeDevice: (bees: IBee | IBee[], action: BeeDeviceManagerActions) =>
    ipcRenderer.invoke("bee:manageBeeDevice", bees, action),
};

/**
 * Export the methods
 */
export default {
  ...audio,
  ...crudBee,
  ...jackJacktripBee,
  ...manageBeeDevice,
};
