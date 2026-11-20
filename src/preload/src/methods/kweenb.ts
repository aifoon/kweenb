import { ipcRenderer } from "electron";
import {
  IBee,
  IRemoteInterface,
  ISatellite,
  ISendToSatelliteAnswer,
  IUpdateAnswer,
  IUpdatesState,
} from "@shared/interfaces";

/**
 * All methods for kweenb with JACK/JACKTRIP
 */
const jackJacktripKweenB = {
  // JACK/JACKTRIP
  calculateCurrentLatency: () =>
    ipcRenderer.invoke("kweenb:calculateCurrentLatency"),
  getKweenBVersion: () => ipcRenderer.invoke("kweenb:getKweenBVersion"),
  findSatellites: (): Promise<ISatellite[]> =>
    ipcRenderer.invoke("satellite:find"),
  sendToSatellite: (satellite: ISatellite): Promise<ISendToSatelliteAnswer> =>
    ipcRenderer.invoke("satellite:send", satellite),
  checkForUpdates: (): Promise<IUpdatesState> =>
    ipcRenderer.invoke("updates:check"),
  updateDevice: (key: string): Promise<IUpdateAnswer> =>
    ipcRenderer.invoke("updates:updateDevice", key),
  downloadKweenB: (): Promise<IUpdateAnswer> =>
    ipcRenderer.invoke("updates:downloadKweenB"),
  getRemoteInterface: (): Promise<IRemoteInterface> =>
    ipcRenderer.invoke("kweenb:getRemoteInterface"),
  openRemoteInterface: (): Promise<void> =>
    ipcRenderer.invoke("kweenb:openRemoteInterface"),
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
