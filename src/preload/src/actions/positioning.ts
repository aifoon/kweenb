import { ipcRenderer } from "electron";
import {
  PositioningControllerAlgorithm,
  PositioningTargetType,
} from "@shared/interfaces";

export default {
  positioning: {
    enablePositioningControllerAlgorithm: (
      algorithm: PositioningControllerAlgorithm,
      enabled: boolean
    ) =>
      ipcRenderer.send(
        "positioning:enablePositioningControllerAlgorithm",
        algorithm,
        enabled
      ),
    enablePositioningControllerTargetType: (
      targetType: PositioningTargetType,
      enabled: boolean
    ) =>
      ipcRenderer.send(
        "positioning:enablePositioningControllerTargetType",
        targetType,
        enabled
      ),
    updatePositioningControllerAlgorithmOptions: <TAlgorithmOptions>(
      algorithm: PositioningControllerAlgorithm,
      options: TAlgorithmOptions
    ) =>
      ipcRenderer.send(
        "positioning:updatePositioningControllerAlgorithmOptions",
        algorithm,
        options
      ),
  },
};
