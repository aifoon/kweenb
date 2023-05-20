import { ipcRenderer } from "electron";
import { IBee } from "@shared/interfaces";

export default {
  beePoller: (action: "start" | "stop" | "pause", params: any[] = []): void => {
    ipcRenderer.send("bee:beePoller", action, params);
  },
  beesPoller: (action: "start" | "stop" | "pause"): void => {
    ipcRenderer.send("bee:beesPoller", action);
  },
  disconnectPozyxMqttBroker: (): void => {
    ipcRenderer.send("positioning:disconnectPozyxMqttBroker");
  },
  sayHello: (name: string) => ipcRenderer.send("hello", name),
  setBeeActive: (id: number, active: boolean) =>
    ipcRenderer.send("bee:setBeeActive", id, active),
  setBeePozyxTagId: (bee: IBee, pozyxTagId: string) =>
    ipcRenderer.send("bee:setBeePozyxTagId", bee, pozyxTagId),
  setJackFolderPath: (jackFolderPath: string) =>
    ipcRenderer.send("kweenb:setJackFolderPath", jackFolderPath),
  setJacktripBinPath: (jacktripBinPath: string) =>
    ipcRenderer.send("kweenb:setJacktripBinPath", jacktripBinPath),
};
