import { ipcRenderer } from "electron";
import { ISettings, ISetting } from "@shared/interfaces";

const crudSettings = {
  fetchSettings: (): Promise<ISettings[]> =>
    ipcRenderer.invoke("setting:fetchSettings"),
  updateSetting: (setting: ISetting) =>
    ipcRenderer.invoke("setting:updateSetting", setting),
};

export default {
  ...crudSettings,
};
