/**
 * BeesPoller is an intervalworker that will poll for the bee status
 */

import { fetchAllBees } from "../../controllers/kweenb";
import { KweenBException } from "../Exceptions/KweenBException";
import { BEE_POLLING_SECONDS } from "../../consts";
import { KweenBGlobal } from "../../kweenb";
import IntervalWorker, { IntervalWorkerState } from "./IntervalWorker";

export default class BeesPoller extends IntervalWorker {
  constructor() {
    super(BEE_POLLING_SECONDS * 1000, true);
  }

  async asyncWorker() {
    try {
      // no work when pausing
      if (this.state === IntervalWorkerState.Pause) return;

      // fetch all the bees
      const bees = await fetchAllBees();

      // send out to renderer
      KweenBGlobal.kweenb.mainWindow.webContents.send("update-bees", bees);
    } catch (error: any) {
      throw new KweenBException(error, true);
    }
  }
}
