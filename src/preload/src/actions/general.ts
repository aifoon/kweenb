import { ipcRenderer } from "electron";
import { IBee } from "@shared/interfaces";

export default {
  followBeeLevels: (owner: "dashboard" | "swarm", beeIds: number[]): void => {
    ipcRenderer.send("monitor:followBeeLevels", owner, beeIds);
  },
  routingLevels: (action: "start" | "stop"): void => {
    ipcRenderer.send(
      action === "start" ? "routing:startLevels" : "routing:stopLevels"
    );
  },
  cancelCloud: (): void => {
    ipcRenderer.send("cloud:cancel");
  },
  cancelFlash: (): void => {
    ipcRenderer.send("speaker:cancelFlash");
  },
  cancelSounds: (): void => {
    ipcRenderer.send("speaker:cancelSounds");
  },
  cancelUploadAudioFiles: (): void => {
    ipcRenderer.send("bee:cancelUploadAudioFiles");
  },
  closeKweenB: (): void => {
    ipcRenderer.send("kweenb:closeKweenB");
  },
  disconnectPozyxMqttBroker: (): void => {
    ipcRenderer.send("positioning:disconnectPozyxMqttBroker");
  },
  pauseUpdateAudioScenes: (pause: boolean): void => {
    ipcRenderer.send("bee:pauseUpdateAudioScenes", pause);
  },
  setBeeActive: (id: number, active: boolean) =>
    ipcRenderer.send("bee:setBeeActive", id, active),
  setBeePozyxTagId: (bee: IBee, pozyxTagId: string) =>
    ipcRenderer.send("bee:setBeePozyxTagId", bee, pozyxTagId),
  setJackFolderPath: (jackFolderPath: string) =>
    ipcRenderer.send("kweenb:setJackFolderPath", jackFolderPath),
  setJacktripBinPath: (jacktripBinPath: string) =>
    ipcRenderer.send("kweenb:setJacktripBinPath", jacktripBinPath),
  stopLookingForSpeakers: (): void => {
    ipcRenderer.send("speaker:stopLookingForSpeakers");
  },
};
