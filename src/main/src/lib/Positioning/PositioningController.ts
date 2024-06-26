import {
  IPositioningSettings,
  IPozyxData,
  ITargetAndOptionsForPositioningAlgorithm,
  PositioningControllerAlgorithm,
  PositioningTargetType,
} from "@shared/interfaces";
import { VolumeControlXY } from "./Algorithms/VolumeControlXY";
import { PositioningAlgorithmBase } from "./Algorithms/PositioningAlgorithmBase";
import { PositioningTarget } from "./PositioningTarget";

export class PositioningController {
  private _targets: PositioningTarget[] = [];

  private _postioningControllerAlgorithms: Map<
    PositioningControllerAlgorithm,
    PositioningAlgorithmBase<any>
  > = new Map();

  private _enabledPositioningControllerAlgorithms: PositioningControllerAlgorithm[] =
    [];

  constructor(positioningTargets: PositioningTarget[]) {
    // init the targets
    this._targets = positioningTargets;

    // add some active algorithms
    this.initPositioningControllerAlgorithms();

    // disable the algorithms by default (only activate them in the UI)
    this.enablePositioningControllerAlgorithm(
      PositioningControllerAlgorithm.VOLUME_CONTROL_XY,
      false
    );
  }

  /**
   * Sets the positioning settings
   */
  public set positioningSettings(settings: IPositioningSettings) {
    this._postioningControllerAlgorithms.forEach((algorithm) => {
      algorithm.positioningSettings = settings;
    });
  }

  /**
   * Init the active positioning controller algorithms
   */
  private initPositioningControllerAlgorithms() {
    /**
     * TODO: Add algorithms here
     * In order to let the conroller work, add the algorithm to the _enabledPositingControllerAlgorithms array
     */

    // Volume Control for XY positions
    this._postioningControllerAlgorithms.set(
      PositioningControllerAlgorithm.VOLUME_CONTROL_XY,
      new VolumeControlXY(this._targets)
    );
  }

  /**
   * Enables/Disables a target
   * @param targetType The target type to enable
   */
  public enableTargetType(targetType: PositioningTargetType, enable: boolean) {
    const target = this._targets.find((t) => t.targetType === targetType);
    if (target) target.enabled = enable;
  }

  /**
   * Enabels/Disables a positioning controller algorithm
   * @param algorithm The algorithm to enable
   * @param enable True to enable, false to disable
   */
  public enablePositioningControllerAlgorithm(
    algorithm: PositioningControllerAlgorithm,
    enable: boolean
  ) {
    if (enable) {
      if (!this._enabledPositioningControllerAlgorithms.includes(algorithm)) {
        this._enabledPositioningControllerAlgorithms.push(algorithm);
      }
    } else {
      const index =
        this._enabledPositioningControllerAlgorithms.indexOf(algorithm);
      if (index !== -1) {
        this._enabledPositioningControllerAlgorithms.splice(index, 1);
      }
    }
  }

  /**
   * Update options for a certain algorithm
   * @param algorithm The algorithm to set the options for
   * @param options The options to set
   */
  public updateOptions(
    algorithm: PositioningControllerAlgorithm,
    options: any
  ) {
    this._postioningControllerAlgorithms.get(algorithm)?.updateOptions(options);
  }

  /**
   * Gets the targets and options for a certain algorithm
   * @param algorithm The algorithm to get the targets and options for
   * @returns The targets and options
   */
  public getTargetsAndOptionsForAlgorithm<TAlgorithmOptions>(
    algorithm: PositioningControllerAlgorithm
  ): ITargetAndOptionsForPositioningAlgorithm<TAlgorithmOptions> {
    const positioningAlgorithm =
      this._postioningControllerAlgorithms.get(algorithm);
    if (!positioningAlgorithm)
      return { targets: [], options: {} as TAlgorithmOptions };
    const positioningAlgorithmTargets = positioningAlgorithm.getTargets();
    return {
      targets: positioningAlgorithmTargets
        .filter((target) => target.enabled)
        .map((target) => target.targetType),
      options: positioningAlgorithm.getOptions() as TAlgorithmOptions,
    };
  }

  /**
   * Action when new positioning data is received
   * @param pozyxData The new positioning data
   */
  public positioningUpdate(pozyxData: Map<string, IPozyxData>) {
    this._enabledPositioningControllerAlgorithms.forEach((algorithm) => {
      this._postioningControllerAlgorithms
        .get(algorithm)
        ?.sendToTargets(pozyxData);
    });
  }
}
