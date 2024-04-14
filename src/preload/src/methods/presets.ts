import { ipcRenderer } from "electron";
import { IAudioPreset } from "@shared/interfaces";

const crudPresets = {
  getAudioPresets: (): Promise<IAudioPreset[]> =>
    ipcRenderer.invoke("presets:getAudioPresets"),
  activatePreset: (fileName: string): Promise<void> =>
    ipcRenderer.invoke("presets:activatePreset", fileName),
};

export default {
  ...crudPresets,
};
