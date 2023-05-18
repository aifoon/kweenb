import {
  IBee,
  IPozyxData,
  PositioningTargetType,
  VolumeControlXYOptions,
} from "@shared/interfaces";

import { ReaperOsc } from "../OSC";
import { PositioningAlgorithmBase } from "./PositioningAlgorithmBase";
import { PositioningTarget } from "../PositioningTarget";

const math = require("mathjs");

export class VolumeControlXY extends PositioningAlgorithmBase<VolumeControlXYOptions> {
  constructor(targets: PositioningTarget[]) {
    super(targets);
    this._options = {
      bees: [],
      beeRadius: 0,
      tagId: "",
      maxVolume: 0.7,
      maxVolumeZoneRadius: 500,
    };
  }

  /**
   * Calculate the volume
   * @param pozyxDataOfTag The pozyx data of the tag
   * @param pozyxDataOfBee The pozyx data of the bee
   * @returns The volume
   */
  private calculateVolume(
    pozyxDataOfTag: IPozyxData,
    pozyxDataOfBee: IPozyxData
  ): number {
    // get the position of the tag and the bee
    const positionOfTag = [
      pozyxDataOfTag.data.coordinates.x,
      pozyxDataOfTag.data.coordinates.y,
    ];
    const positionOfBee = [
      pozyxDataOfBee.data.coordinates.x,
      pozyxDataOfBee.data.coordinates.y,
    ];

    // calculate the distance between the tag and the bee
    const distance = Number(math.distance(positionOfTag, positionOfBee));

    // validate if the bee is in the zone
    let volume = 0;
    if (distance <= 0) volume = 0;
    else if (distance <= this._options.maxVolumeZoneRadius)
      volume = this._options.maxVolume;
    else if (distance <= this._options.beeRadius)
      volume = this._options.maxVolume - distance / this._options.beeRadius;
    else volume = 0;

    // validate if the volume is not negative
    if (volume <= 0.1) volume = 0;

    // return the volume
    return volume;
  }

  /**
   * Validate the bee and pozyx data
   * @param bee The bee
   * @param pozyxData The pozyx data
   * @returns Boolean if the data is valid
   */
  private validatePozyxData(
    bee: IBee,
    pozyxData: Map<string, IPozyxData>
  ): boolean {
    // validate if we receive data from the distance tag
    if (pozyxData.get(this._options.tagId) === undefined) return false;
    const pozyxDataOfTag = pozyxData.get(this._options.tagId);
    if (pozyxDataOfTag === undefined) return false;

    // validate if we receive data from the bee
    if (!bee.pozyxTagId) return false;
    const pozyxDataOfBee = pozyxData.get(bee.pozyxTagId);
    if (pozyxDataOfBee === undefined) return false;

    // everything is fine
    return true;
  }

  /**
   * Send the data to the targets
   * @param pozyxData The pozyx data
   */
  public sendToTargets(pozyxData: Map<string, IPozyxData>) {
    this._targets.forEach((target) => {
      this._options.bees.forEach((bee) => {
        // validate if we receive data from the distance tag
        if (!this.validatePozyxData(bee, pozyxData) || !bee || !bee.pozyxTagId)
          return;

        // get the pozxy data of tag and bee
        const pozyxDataOfTag = pozyxData.get(this._options.tagId);
        const pozyxDataOfBee = pozyxData.get(bee.pozyxTagId);

        // validate data
        if (!pozyxDataOfTag || !pozyxDataOfBee) return;

        // calculate the volume
        const volume = this.calculateVolume(pozyxDataOfTag, pozyxDataOfBee);

        // send out to Reaper in case we have received data
        if (
          target.targetType === PositioningTargetType.Reaper &&
          target.enabled
        ) {
          (target.target as ReaperOsc).setTrackVolume(bee.id, volume);
        }
      });
    });
  }
}
