import {
  IBee,
  IPozyxData,
  PositioningTargetType,
  VolumeControlXYOptions,
} from "@shared/interfaces";

import { LogarithmicVolumeCalculator } from "@shared/lib/LogarithmicVolumeCalculator";
import { POSITIONING_INTERVAL_MS } from "../../../consts";
import { ReaperOsc } from "../OSC";
import { PositioningAlgorithmBase } from "./PositioningAlgorithmBase";
import { PositioningTarget } from "../PositioningTarget";
import { Easing } from "../Easing";

const math = require("mathjs");

export class VolumeControlXY extends PositioningAlgorithmBase<VolumeControlXYOptions> {
  private _currentVolumes: Map<number, number> = new Map();

  private _logratithmicVolumeCalculator: LogarithmicVolumeCalculator;

  constructor(targets: PositioningTarget[]) {
    super(targets);
    this._logratithmicVolumeCalculator = new LogarithmicVolumeCalculator(60);
    this._options = {
      bees: [],
      beeRadius: 2000,
      tagId: "",
      maxVolume: 0.7,
      maxVolumeZoneRadius: 500,
      easingIntervalTime: 20,
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
    let distance = 0;

    // when the max volume zone radius is 0, calculate the distance between the tag and the bee
    if (this._options.maxVolumeZoneRadius === 0) {
      // calculate the distance between the tag and the bee
      distance = Number(math.distance(positionOfTag, positionOfBee));
    }

    // when the max volume zone radius is not 0,
    // calculate the distance between the tag and the circle by the position of a bee and
    // the circle center of the max volume zone
    else {
      // Calculate the distance between the point and the circle's outer border
      distance = Math.sqrt(
        (positionOfTag[0] - positionOfBee[0]) ** 2 +
          (positionOfTag[1] - positionOfBee[1]) ** 2
      );

      // Calculate the shortest distance by subtracting the circle's radius
      distance = Math.abs(distance - this._options.maxVolumeZoneRadius);
    }

    // validate if the bee is in the zone
    let volume = 0;
    if (distance > this._options.beeRadius) volume = 0;
    else if (distance <= this._options.beeRadius)
      volume = distance / this._options.beeRadius;
    else volume = 0;

    // calculate the logarithmic volume
    volume = this._logratithmicVolumeCalculator.calculate(
      volume,
      2,
      this._options.maxVolume
    ).vol;

    // validate if the volume is not negative
    if (volume <= 0) volume = 0;

    // return the volume
    return volume;
  }

  /**
   * Caclulate volumes by pozyx data
   * @param pozyxData
   */
  private calculateVolumesByPozyxData(pozyxData: Map<string, IPozyxData>) {
    // define the output
    const output: Map<number, number> = new Map();

    // loop over bees
    this._options.bees.forEach((bee) => {
      // validate if we receive data from the distance tag
      if (!this.validatePozyxData(bee, pozyxData) || !bee || !bee.pozyxTagId)
        return;

      // get the pozxy data of tag and bee
      const pozyxDataOfTag = pozyxData.get(this._options.tagId);
      const pozyxDataOfBee = pozyxData.get(bee.pozyxTagId);

      // validate data
      if (!pozyxDataOfTag || !pozyxDataOfBee) return;

      try {
        // calculate the volume for this bee
        output.set(
          bee.id,
          this.calculateVolume(pozyxDataOfTag, pozyxDataOfBee)
        );
      } catch (e) {
        console.error(e);
      }
    });

    // return the output
    return output;
  }

  /**
   * Validate the bee and pozyx data
   * @param bee The bee
   * @param pozyxData The pozyx data
   * @returns Boolean if the data is valid
   */
  private validatePozyxData(bee: IBee, pozyxData: Map<string, IPozyxData>) {
    // validate if we receive data from the bee
    if (!bee || !bee.pozyxTagId) {
      return false;
    }

    const tagData = pozyxData.get(this._options.tagId);
    const beeData = pozyxData.get(bee.pozyxTagId);

    // validate if we receive data from the distance tag and bee
    if (!tagData || !beeData) {
      return false;
    }

    const tagCoordinates = tagData.data.coordinates;

    // validate if we have x's and y's
    if (tagCoordinates.x === undefined || tagCoordinates.y === undefined) {
      return false;
    }

    // everything is fine
    return true;
  }

  /**
   * Send the data to the targets
   * @param pozyxData The pozyx data
   */
  public sendToTargets(pozyxData: Map<string, IPozyxData>) {
    // calculate the volumes
    const newVolumes = this.calculateVolumesByPozyxData(pozyxData);

    // get the bees
    const bees = Array.from(newVolumes.keys());

    // loop over target and set volumes
    this._targets.forEach((target) => {
      bees.forEach((bee) => {
        if (
          target.targetType === PositioningTargetType.Reaper &&
          target.enabled
        ) {
          // animate from the current volume to the new volume
          // over a duration of 300ms (this is also the time it takes to receive new data),
          new Easing(this._options.easingIntervalTime).animate(
            this._currentVolumes.get(bee) || 0,
            newVolumes.get(bee) || 0,
            POSITIONING_INTERVAL_MS,
            (volume) => {
              (target.target as ReaperOsc).setTrackVolume(bee, volume);
            }
          );
        }
      });
    });

    // replace the current volumes
    this._currentVolumes = newVolumes;
  }
}
