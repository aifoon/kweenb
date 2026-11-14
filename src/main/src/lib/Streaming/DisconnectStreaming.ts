import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";

export default class DisconnectStreaming extends Streaming {
  /**
   * Disconnect streaming procedure
   */
  public async handleConnect(): Promise<void> {
    try {
      /**
       * Step 1: Fetch active bees
       */

      const activeBees = await this.fetchActiveBees();

      /**
       * Step 2: Stop the audio chain on the active bees that can be reached
       * (a bee that is gone has nothing to stop)
       */

      let stopError: Error | null = null;
      try {
        this.sendInfo("Stopping Jack, Jacktrip & Pure Data on active bees");
        await Zwerm3ApiHelpers.stopStreamOnBees(
          activeBees.filter((bee) => bee.isOnline)
        );
      } catch (e: any) {
        // kweenb itself is stopped first, the bees that failed are reported after
        stopError = e;
      }

      /**
       * Step 3: Kill Jack & Jacktrip processes on kweenb
       */

      await this.killJackAndJacktripOnKweenB();

      if (stopError) {
        // the message names every bee that failed, with its own reason
        throw new Error(
          `Error while stopping Jack, Jacktrip & Pure Data on bees. ${stopError.message}`
        );
      }

      /**
       * Exit the process by sending success
       */
      this.sendSuccess();
    } catch (e: any) {
      this.sendError(e.message);
    }
  }
}
