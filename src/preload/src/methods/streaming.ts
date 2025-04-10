import { ipcRenderer } from "electron";

export default {
  streaming: {
    startDisconnectStreaming: () =>
      ipcRenderer.invoke("streaming:startDisconnectStreaming"),
    startHubStreaming: () => ipcRenderer.invoke("streaming:startHubStreaming"),
    startP2PStreaming: () => ipcRenderer.invoke("streaming:startP2PStreaming"),
    startTriggerOnlyStreaming: () =>
      ipcRenderer.invoke("streaming:startTriggerOnlyStreaming"),
  },
};
