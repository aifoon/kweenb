import { ipcRenderer } from "electron";
import { ITheKween } from "@shared/interfaces";

export default {
  theKween: {
    killJackAndJacktripOnTheKween: () =>
      ipcRenderer.invoke("thekween:killJackAndJacktrip"),
    startHubServerOnTheKween: () =>
      ipcRenderer.invoke("thekween:startHubServer"),
    makeHubAudioConnections: () =>
      ipcRenderer.invoke("thekween:makeHubAudioConnections"),
    validateHive: (): Promise<boolean> =>
      ipcRenderer.invoke("thekween:validateHive"),

    fetchTheKween: (): Promise<ITheKween> =>
      ipcRenderer.invoke("thekween:fetchTheKween"),
    isZwerm3ApiRunningOnTheKween: (): Promise<boolean> =>
      ipcRenderer.invoke("thekween:isZwerm3ApiRunningOnTheKween"),
  },
};
