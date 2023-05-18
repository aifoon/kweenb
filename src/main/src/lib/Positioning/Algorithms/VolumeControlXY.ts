import {
  IPozyxData,
  PositioningTargetType,
  VolumeControlXYOptions,
} from "@shared/interfaces";
import { ReaperOsc } from "../OSC";
import { PositioningAlgorithmBase } from "./PositioningAlgorithmBase";
import { PositioningTarget } from "../PositioningTarget";

export class VolumeControlXY extends PositioningAlgorithmBase<VolumeControlXYOptions> {
  constructor(targets: PositioningTarget[]) {
    super(targets);
    this._options = { bees: [], beeRadius: 0, tagId: "" };
  }

  // eslint-disable-next-line class-methods-use-this
  private calculateVolume() {
    // generate random number between 0 and 1
    const random = Math.random();
    return random;
  }

  public sendToTargets(pozyxData: Map<string, IPozyxData>) {
    this._targets.forEach((target) => {
      if (
        target.targetType === PositioningTargetType.Reaper &&
        target.enabled
      ) {
        (target.target as ReaperOsc).setTrackVolume(1, this.calculateVolume());
      }
    });
  }
}
