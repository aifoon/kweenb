import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";
import { Utils } from "@shared/utils";

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
       * Step 2: Start Jack on every bee
       */

      try {
        const startJackOnBeePromises = activeBees.map((bee) => {
          Zwerm3ApiHelpers.startJack(bee.ipAddress, true);
        });
        await Promise.all(startJackOnBeePromises);
        await Utils.delay(2000);
      } catch (e: any) {
        throw new Error(
          `Error while starting Jack on active bees: ${e.message}`
        );
      }

      /**
       * Step 3: Start Pure Data on active bees
       */

      await this.startPureData(activeBees);

      /**
       * Exit the process by sending success
       */
      this.sendSuccess();
    } catch (e: any) {
      this.sendError(e.message);
    }
  }
}
