import { ipcRenderer } from "electron";
import { IBee } from "@shared/interfaces";

/**
 * All methods for kweenb with JACK/JACKTRIP
 */
const jackJacktripKweenB = {
  // JACK/JACKTRIP
  calculateCurrentLatency: () =>
    ipcRenderer.invoke("kweenb:calculateCurrentLatency"),
  disconnectP2PAudioConnectionsKweenB: () =>
    ipcRenderer.invoke("kweenb:disconnectP2PAudioConnections"),
  getKweenBVersion: () => ipcRenderer.invoke("kweenb:getKweenBVersion"),
  isJackAndJacktripInstalled: () =>
    ipcRenderer.invoke("kweenb:isJackAndJacktripInstalled"),
  killJackAndJacktripOnKweenB: () =>
    ipcRenderer.invoke("kweenb:killJackAndJacktrip"),
  startJacktripHubServer: () =>
    ipcRenderer.invoke("kweenb:startJacktripHubServer"),
  startJackWithJacktripHubClientKweenB: () =>
    ipcRenderer.invoke("kweenb:startJackWithJacktripHubClient"),
  startJackWithJacktripP2PClientKweenB: (bee: IBee) =>
    ipcRenderer.invoke("kweenb:startJackWithJacktripP2PClient", bee),
  makeHubAudioConnectionsKweenB: () =>
    ipcRenderer.invoke("kweenb:makeHubAudioConnections"),
  makeP2PAudioConnectionsKweenB: () =>
    ipcRenderer.invoke("kweenb:makeP2PAudioConnections"),
  makeP2PAudioConnectionKweenB: (bee: IBee) =>
    ipcRenderer.invoke("kweenb:makeP2PAudioConnection", bee),
};

/**
 * General methods for kweenb
 */
const generalKweenB = {
  openDialog: (
    method: keyof Electron.Dialog,
    params: Electron.OpenDialogOptions
  ) => ipcRenderer.invoke("kweenb:openDialog", method, params),
};

export default {
  ...generalKweenB,
  ...jackJacktripKweenB,
};
