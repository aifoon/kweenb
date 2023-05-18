import { PositioningController } from "./PositioningController";

export default class PositioningControllerSingleton {
  private static _instance: PositioningController;

  public static getInstance(): PositioningController {
    if (this._instance == null) {
      this._instance = new PositioningController();
    }
    return this._instance;
  }
}
