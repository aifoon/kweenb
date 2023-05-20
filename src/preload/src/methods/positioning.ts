import { ipcRenderer } from "electron";
import { PositioningControllerAlgorithm } from "@shared/interfaces";

export default {
  positioning: {
    connectPozyxMqttBroker: (pozyxMqttBrokerUrl: string): Promise<boolean> =>
      ipcRenderer.invoke(
        "positioning:connectPozyxMqttBroker",
        pozyxMqttBrokerUrl
      ),
    getAllTagIds: (): Promise<string[]> =>
      ipcRenderer.invoke("positioning:getAllTagIds"),
    getTargetsAndOptionsForAlgorithm: (
      algorithm: PositioningControllerAlgorithm
    ) =>
      ipcRenderer.invoke(
        "positioning:getTargetsAndOptionsForAlgorithm",
        algorithm
      ),
  },
};
