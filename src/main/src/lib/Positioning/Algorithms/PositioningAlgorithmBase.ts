import { IPositioningSettings, IPozyxData } from "@shared/interfaces";
import { PositioningTarget } from "../PositioningTarget";

export abstract class PositioningAlgorithmBase<TAlgorithmOptions> {
  protected _targets: PositioningTarget[] = [];

  protected _positioningSettings: IPositioningSettings | undefined | null;

  constructor(targets: PositioningTarget[], settings?: IPositioningSettings) {
    this._targets = targets;
    this._positioningSettings = settings;
  }

  protected _options: TAlgorithmOptions;

  /**
   * Makes setting the settings possible
   */
  public set positioningSettings(settings: IPositioningSettings) {
    this._positioningSettings = settings;
  }

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
