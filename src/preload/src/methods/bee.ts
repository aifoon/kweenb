import { ipcRenderer } from "electron";
import {
  AudioFile,
  AudioScene,
  IBee,
  IBeeConfig,
  IBeeInput,
  IBeeState,
} from "@shared/interfaces";
import { PDAudioParam } from "@shared/enums";

/**
 * All the audio settings for the bee (eg. triggering)
 */
const audio = {
  deleteAudio: (bee: IBee, path: string): Promise<void> =>
    ipcRenderer.invoke("bee:deleteAudio", bee, path),
  getAudioFiles: (bee: IBee): Promise<AudioFile[]> =>
    ipcRenderer.invoke("bee:getAudioFiles", bee),
  getAudioScenes: (): Promise<AudioScene[]> =>
    ipcRenderer.invoke("bee:getAudioScenes"),
  killPureData: (bee: IBee) => ipcRenderer.invoke("bee:killPureData", bee),
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
  startPureData: (bees: IBee[] | IBee) =>
    ipcRenderer.invoke("bee:startPureData", bees),
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
  killJack: (bee: IBee) => ipcRenderer.invoke("bee:killJack", bee),
  killJacktrip: (bee: IBee) => ipcRenderer.invoke("bee:killJacktrip", bee),
  makeAudioConnectionBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:makeAudioConnection", bee),
  startJack: (bee: IBee, triggerOnly: boolean = false) =>
    ipcRenderer.invoke("bee:startJack", bee, triggerOnly),
  startJackWithJacktripHubClientBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJackWithJacktripHubClient", bee),
  startJackWithJacktripP2PServerBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJackWithJacktripP2PServer", bee),
  startJacktripP2PServerBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJacktripP2PServer", bee),
};

/**
 * Configuration methods for the bee
 */
const configBee = {
  getBeeConfig: (bee: IBee | number): Promise<IBeeConfig> =>
    ipcRenderer.invoke("bee:getBeeConfig", bee),
  saveConfig: (bee: IBee, config: Partial<IBeeConfig>) =>
    ipcRenderer.invoke("bee:saveConfig", bee, config),
};

/**
 * Export the methods
 */
export default {
  ...audio,
  ...crudBee,
  ...jackJacktripBee,
  ...configBee,
};
