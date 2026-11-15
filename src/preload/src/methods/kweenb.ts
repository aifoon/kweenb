import { ipcRenderer } from "electron";
import { IBee } from "@shared/interfaces";

/**
 * All methods for kweenb with JACK/JACKTRIP
 */
const jackJacktripKweenB = {
  // JACK/JACKTRIP
  calculateCurrentLatency: () =>
    ipcRenderer.invoke("kweenb:calculateCurrentLatency"),
  getKweenBVersion: () => ipcRenderer.invoke("kweenb:getKweenBVersion"),
  startJackWithJacktripP2PClientKweenB: (bee: IBee) =>
    ipcRenderer.invoke("kweenb:startJackWithJacktripP2PClient", bee),
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
