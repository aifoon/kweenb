import { ipcRenderer } from "electron";

type Callback = (event: any, ...args: any[]) => void;

const handlers = {
  onAboutKweenB: { channel: "about-kweenb", cleanup: false },
  onAppMode: { channel: "app-mode", cleanup: false },
  onAppClosing: { channel: "app-closing", cleanup: false },
  onClosing: { channel: "closing", cleanup: false },
  onError: { channel: "error", cleanup: false },
  onImportedBees: { channel: "imported-bees", cleanup: true },
  onImportedSettings: { channel: "imported-settings", cleanup: true },
  onInfo: { channel: "info", cleanup: false },
  onLoading: { channel: "loading", cleanup: false },
  onPozyxData: { channel: "pozyx-data", cleanup: true },
  onShowView: { channel: "show-view", cleanup: false },
  onStreamingConnectionStatus: {
    channel: "streaming-connection-status",
    cleanup: true,
  },
  onSuccess: { channel: "success", cleanup: false },
  onUpdateBees: { channel: "update-bees", cleanup: true },
  onUploadAudioProgress: { channel: "upload-audio-progress", cleanup: true },
} as const;

const api: Record<string, (callback: Callback) => void | (() => void)> = {};

for (const [key, { channel, cleanup }] of Object.entries(handlers)) {
  api[key] = (callback: Callback) => {
    ipcRenderer.on(channel, callback);
    return cleanup ? () => ipcRenderer.removeAllListeners(channel) : undefined;
  };
}

export default api;
