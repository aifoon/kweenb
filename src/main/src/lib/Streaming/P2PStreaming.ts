import KweenBHelpers from "../KweenB/KweenBHelpers";
import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";
import { START_PORT_JACKTRIP } from "../../consts";
import { Utils } from "@shared/utils";

export default class P2PStreaming extends Streaming {
  /**
   * Connect streaming procedure in HUB mode
   */
  public async handleConnect(): Promise<void> {
    try {
      /**
       * Step 1: Generic pre-connection check
       */

      const activeBees = await this.preConnectionCheck();

      /**
       * Step 2: Start Jack and Jacktrip on active bees
       */
      try {
        const startJackWithJacktripP2PServerPromises = activeBees.map((bee) => {
          Zwerm3ApiHelpers.startJackWithJacktripP2PServer(
            bee.ipAddress,
            bee.name
          );
        });
        await Promise.all(startJackWithJacktripP2PServerPromises);
      } catch (e: any) {
        throw new Error(
          `Error while starting Jack & Jacktrip on active bees: ${e.message}`
        );
      }

      /**
       * Step 4: Start Jack & Jacktrip P2P clients on KweenB
       */

      try {
        const startJackWithJacktripP2PClientPromises = activeBees.map((bee) => {
          const localPort = START_PORT_JACKTRIP + (bee.id - 1);
          KweenBHelpers.startJackWithJacktripP2PClient(
            bee.ipAddress,
            localPort,
            bee.name
          );
        });
        await Promise.all(startJackWithJacktripP2PClientPromises);
        await Utils.delay(2000);
      } catch (e: any) {
        throw new Error(
          `Error while starting Jack & Jacktrip clients on active bees: ${e.message}`
        );
      }

      /**
       * Step 3: Start Pure Data on active bees
       */

      await this.startPureData(activeBees);

      /**
       * Step 5: Make audio connection on active bees
       */

      await this.makeAudioConnection(activeBees);

      /**
       * Step 6: Make all P2P audio connections on KweenB
       */
      try {
        this.sendInfo("Make all P2P audio connections on KweenB");
        await KweenBHelpers.makeP2PAudioConnections();
      } catch (e: any) {
        throw new Error(
          `Error while making all P2P audio connections on KweenB: ${e.message}`
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
