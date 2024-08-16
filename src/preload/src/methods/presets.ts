import { ipcRenderer } from "electron";
import { IAudioPreset } from "@shared/interfaces";
import { AppMode } from "@shared/enums";
import { DEFAULT_APP_MODE } from "@shared/consts";

const crudPresets = {
  getAudioPresets: (
    appMode: AppMode = DEFAULT_APP_MODE
  ): Promise<IAudioPreset[]> =>
    ipcRenderer.invoke("presets:getAudioPresets", appMode),
  activatePreset: (fileName: string): Promise<void> =>
    ipcRenderer.invoke("presets:activatePreset", fileName),
};

export default {
  ...crudPresets,
};
