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
  killJackAndJacktripOnKweenB: () =>
    ipcRenderer.invoke("kweenb:killJackAndJacktrip"),
  startJackWithJacktripHubClientKweenB: () =>
    ipcRenderer.invoke("kweenb:startJackWithJacktripHubClient"),
  startJackWithJacktripP2PClientKweenB: (bee: IBee) =>
    ipcRenderer.invoke("kweenb:startJackWithJacktripP2PClient", bee),
  makeP2PAudioConnectionsKweenB: () =>
    ipcRenderer.invoke("kweenb:makeP2PAudioConnections"),
  makeP2PAudioConnectionKweenB: (bee: IBee) =>
    ipcRenderer.invoke("kweenb:makeP2PAudioConnection", bee),
};

export default {
  ...jackJacktripKweenB,
};
