import { ipcRenderer } from "electron";

type Callback = (event: any, ...args: any[]) => void;

const handlers = {
  onAboutKweenB: { channel: "about-kweenb", cleanup: false },
  onAdoptFromNetwork: { channel: "adopt-from-network", cleanup: false },
  onAdoptSpeakerProgress: { channel: "adopt-speaker-progress", cleanup: true },
  onAppMode: { channel: "app-mode", cleanup: false },
  onAppClosing: { channel: "app-closing", cleanup: false },
  onCheckForUpdates: { channel: "check-for-updates", cleanup: false },
  onUpdatesAvailable: { channel: "updates-available", cleanup: false },
  onUpdateProgress: { channel: "update-progress", cleanup: true },
  onCloudBackup: { channel: "cloud-backup", cleanup: false },
  onCloudProgress: { channel: "cloud-progress", cleanup: true },
  onClosing: { channel: "closing", cleanup: false },
  onError: { channel: "error", cleanup: false },
  onFlashProgress: { channel: "flash-progress", cleanup: true },
  onFlashSpeaker: { channel: "flash-speaker", cleanup: false },
  onImportedBees: { channel: "imported-bees", cleanup: true },
  onImportedSettings: { channel: "imported-settings", cleanup: true },
  onInfo: { channel: "info", cleanup: false },
  onLoading: { channel: "loading", cleanup: false },
  onNewSpeaker: { channel: "new-speaker", cleanup: false },
  onBeeLevels: { channel: "bee-levels", cleanup: false },
  onRoutingLevels: { channel: "routing-levels", cleanup: true },
  onRemoteInterface: { channel: "remote-interface", cleanup: false },
  onSendToSatellite: { channel: "send-to-satellite", cleanup: false },
  onRestoreSounds: { channel: "restore-sounds", cleanup: false },
  onPozyxData: { channel: "pozyx-data", cleanup: true },
  onSaveSounds: { channel: "save-sounds", cleanup: false },
  onShowView: { channel: "show-view", cleanup: false },
  onSoundsProgress: { channel: "sounds-progress", cleanup: true },
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
