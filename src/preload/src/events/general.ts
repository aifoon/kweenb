import { ipcRenderer } from "electron";

export default {
  onAboutKweenB: (callback: any) => {
    ipcRenderer.on("about-kweenb", callback);
  },
  onAppMode: (callback: any) => {
    ipcRenderer.on("app-mode", callback);
  },
  onClosing: (callback: any) => {
    ipcRenderer.on("closing", callback);
  },
  onError: (callback: any) => {
    ipcRenderer.on("error", callback);
  },
  onImportedBees: (callback: any) => {
    const channel = "imported-bees";
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeAllListeners(channel);
  },
  onImportedSettings: (callback: any) => {
    const channel = "imported-settings";
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeAllListeners(channel);
  },
  onInfo: (callback: any) => {
    ipcRenderer.on("info", callback);
  },
  onLoading: (callback: any) => {
    ipcRenderer.on("loading", callback);
  },
  onPozyxData: (callback: any) => {
    const channel = "pozyx-data";
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeAllListeners(channel);
  },
  onSuccess: (callback: any) => {
    ipcRenderer.on("success", callback);
  },
  onUpdateBees: (callback: any) => {
    const channel = "update-bees";
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeAllListeners(channel);
  },
  onUpdateBee: (callback: any) => {
    const channel = "update-bee";
    ipcRenderer.on(channel, callback);
    return () => ipcRenderer.removeAllListeners(channel);
  },
};
