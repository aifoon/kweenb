import { ipcRenderer } from "electron";
import { IBee, IBeeConfig, IBeeInput, IBeeState } from "@shared/interfaces";
import { PDAudioParam } from "@shared/enums";

/**
 * All the audio settings for the bee (eg. triggering)
 */
const audio = {
  setAudioParam: (
    bees: IBee[] | IBee,
    pdAudioParam: PDAudioParam,
    value: number | boolean
  ) => ipcRenderer.invoke("bee:setAudioParam", bees, pdAudioParam, value),
  setAudioParamForAllBees: (
    pdAudioParam: PDAudioParam,
    value: number | boolean
  ) => ipcRenderer.invoke("bee:setAudioParamForAllBees", pdAudioParam, value),
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
  hookBeeOnCurrentHive: (bee: IBee) =>
    ipcRenderer.invoke("bee:hookOnCurrentHive", bee),
  makeP2PAudioConnectionBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:makeP2PAudioConnection", bee),
  startJack: (bee: IBee) => ipcRenderer.invoke("bee:startJack", bee),
  startJackWithJacktripHubClientBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJackWithJacktripHubClient", bee),
  startJackWithJacktripP2PServerBee: (bee: IBee) =>
    ipcRenderer.invoke("bee:startJackWithJacktripP2PServer", bee),
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
