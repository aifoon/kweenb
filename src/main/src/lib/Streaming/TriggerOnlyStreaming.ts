import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";

export default class TriggerOnlyStreaming extends Streaming {
  /**
   * Connect in TriggerOnly mode
   */
  public async handleConnect(): Promise<void> {
    try {
      /**
       * Step 1: Generic pre-connection check
       */

      const activeBees = await this.preConnectionCheck();

      /**
       * Step 2: Start Jack & Pure Data on every bee (no stream)
       */

      await this.startStreamOnBees(
        activeBees,
        await Zwerm3ApiHelpers.createTriggerStreamRequest(),
        "Jack & Pure Data"
      );

      /**
       * Exit the process by sending success
       */
      this.sendSuccess();
    } catch (e: any) {
      this.sendError(e.message);
    }
  }
}
