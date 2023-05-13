import { IPozyxData } from "@shared/interfaces";
import { PositioningTarget } from "../PositioningController";

export abstract class PositioningControllerBase {
  protected _targets: PositioningTarget[] = [];

  protected _options: any;

  constructor(targets: PositioningTarget[]) {
    this._targets = targets;
  }

  /**
   * Sets options, needed for a certain algorithm to work
   * @param options
   */
  public setOptions(options: any) {
    this._options = options;
  }

  /**
   * This method will always be available, but can be overridden by the child class
   * @param pozyxData
   */
  public abstract sendToTargets(pozyxData: Map<string, IPozyxData>): void;
}