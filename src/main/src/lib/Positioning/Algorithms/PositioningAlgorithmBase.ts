import { IPozyxData, VolumeControlXYOptions } from "@shared/interfaces";
import { PositioningTarget } from "../PositioningTarget";

export abstract class PositioningAlgorithmBase<TAlgorithmOptions> {
  protected _targets: PositioningTarget[] = [];

  constructor(targets: PositioningTarget[]) {
    this._targets = targets;
  }

  protected _options: TAlgorithmOptions;

  /**
   * Sets options, needed for a certain algorithm to work
   * @param options
   */
  public updateOptions(options: Partial<TAlgorithmOptions>): void {
    this._options = { ...this._options, ...options };
  }

  /**
   * Gets the options for the algorithm
   * @returns the options for the algorithm
   */
  public getOptions(): TAlgorithmOptions {
    return this._options;
  }

  /**
   * Gets the targets for the algorithm
   * @returns
   */
  public getTargets() {
    return this._targets;
  }

  /**
   * This method will always be available, but can be overridden by the child class
   * @param pozyxData
   */
  public abstract sendToTargets(pozyxData: Map<string, IPozyxData>): void;
}
