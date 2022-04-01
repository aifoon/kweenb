/**
 * BeesPoller is an intervalworker that will poll for the bee status
 */

import { IBee } from "@shared/interfaces";
import deepEqual from "deep-equal";
import { KweenBException } from "../Exceptions/KweenBException";
import { BEE_POLLING_SECONDS } from "../../consts";
import { KweenBGlobal } from "../../kweenb";
import IntervalWorker, { IntervalWorkerState } from "./IntervalWorker";
import beeHelpers from "../KweenB/BeeHelpers";

export default class BeePoller extends IntervalWorker {
  private _currentBee: IBee;

  constructor() {
    super(BEE_POLLING_SECONDS * 1000, true);
  }

  /**
   * Sending out the current bee to the renderer
   */
  private _sendBeeToRenderer() {
    KweenBGlobal.kweenb.mainWindow.webContents.send(
      "update-bee",
      this._currentBee
    );
  }

  /**
   * Do some work
   * @returns
   */
  async asyncWorker() {
    try {
      // no work when pausing
      if (this.state === IntervalWorkerState.Pause) return;

      // check if a param is available
      if (!this.params || this.params.length === 0 || this.params.length > 1)
        return;

      // get the id out of the params
      const beeId = Number(this.params[0]);

      // get the requested bee
      const requestedBee = await beeHelpers.getBee(beeId);

      // check if bee is equal (for performance)
      if (!deepEqual(requestedBee, this._currentBee)) {
        this._currentBee = requestedBee;
        this._sendBeeToRenderer();
      }
    } catch (error: any) {
      throw new KweenBException(error, true);
    }
  }
}
