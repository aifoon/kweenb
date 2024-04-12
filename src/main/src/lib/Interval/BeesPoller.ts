/**
 * BeesPoller is an intervalworker that will poll for the bee status
 */

import { IBee } from "@shared/interfaces";
import deepEqual from "deep-equal";
import { BeeActiveState } from "@shared/enums";
import { KweenBException } from "../Exceptions/KweenBException";
import { BEE_POLLING_SECONDS } from "../../consts";
import { KweenBGlobal } from "../../kweenb";
import IntervalWorker, { IntervalWorkerState } from "./IntervalWorker";
import beeHelpers from "../KweenB/BeeHelpers";

export default class BeesPoller extends IntervalWorker {
  private _currentBees: IBee[] = [];

  constructor() {
    super(BEE_POLLING_SECONDS * 1000, true);
  }

  /**
   * Sending out the current bees to the renderer
   */
  private _sendBeesToRenderer() {
    KweenBGlobal.kweenb.mainWindow.webContents.send(
      "update-bees",
      this._currentBees
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

      // fetch all the bees
      const touchedBees = await beeHelpers.getAllBees(BeeActiveState.ACTIVE);

      // if there are no bees, current and touchd, return nothing
      if (this._currentBees.length === 0 && touchedBees.length === 0) return;

      // something changed... deletion or creation? let renderer know
      if (this._currentBees.length !== touchedBees.length) {
        this._currentBees = touchedBees;
        this._sendBeesToRenderer();
        return;
      }

      // nothing changed in length, do a deep equality scan to validate
      // if we need to alert the renderer
      if (this._currentBees.length === touchedBees.length) {
        const compareResults = this._currentBees.map((currentBee) => {
          // first find the bee in our tochedBees
          const touchedBee = touchedBees.find(
            (currentTouchedBee) => currentTouchedBee.id === currentBee.id
          );

          // if the touchedbee wasn't found, strange, but definitly something changed
          if (!touchedBee) return true;

          // do a deep equal comparison
          return !deepEqual(touchedBee, currentBee);
        });

        // if we found a true in the results, something changed
        if (compareResults.filter((r) => r).length > 0) {
          this._currentBees = touchedBees;
          this._sendBeesToRenderer();
          return;
        }
      }
    } catch (error: any) {
      throw new KweenBException(error, true);
    }
  }
}
