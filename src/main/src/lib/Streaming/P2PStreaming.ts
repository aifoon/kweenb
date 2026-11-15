import { ChannelType } from "@shared/enums";
import KweenBHelpers from "../KweenB/KweenBHelpers";
import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";
import { START_PORT_JACKTRIP } from "../../consts";
import { Utils } from "@shared/utils";

export default class P2PStreaming extends Streaming {
  /**
   * Connect streaming procedure in P2P mode
   */
  public async handleConnect(): Promise<void> {
    try {
      /**
       * Step 1: Generic pre-connection check
       */

      const activeBees = await this.preConnectionCheck();

      /**
       * Step 2: Start the audio chain on active bees. Every bee waits for
       * the Jacktrip connection from kweenb, so the bees are not awaited
       * here but after kweenb started its clients (step 3).
       */

      const startStreamOnBees = this.startStreamOnBees(
        activeBees,
        await Zwerm3ApiHelpers.createP2PStreamRequest(),
        "Jack, Jacktrip & Pure Data"
      );

      // a failure is reported when the bees are awaited
      startStreamOnBees.catch(() => {});

      /**
       * Step 3: Start Jack & Jacktrip P2P clients on KweenB
       */

      try {
        const startJackWithJacktripP2PClientPromises = activeBees.map((bee) => {
          const localPort = START_PORT_JACKTRIP + (bee.id - 1);
          return KweenBHelpers.startJackWithJacktripP2PClient(
            bee.ipAddress,
            localPort,
            KweenBHelpers.getJackClientName(bee),
            bee.channelType === ChannelType.STEREO ? 2 : 1
          );
        });
        await Promise.all(startJackWithJacktripP2PClientPromises);

        // give the Jacktrip clients on kweenb the time to show up in Jack
        await Utils.delay(2000);
      } catch (e: any) {
        throw new Error(
          `Error while starting Jack & Jacktrip clients on kweenb: ${e.message}`
        );
      }

      /**
       * Step 4: Wait until every bee answered that sound can pass
       */

      await startStreamOnBees;

      /**
       * Step 5: Make all P2P audio connections on KweenB
       */
      try {
        this.sendInfo("Make all P2P audio connections on KweenB");
        await KweenBHelpers.makeP2PAudioConnections(activeBees);
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
