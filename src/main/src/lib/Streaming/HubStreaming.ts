import KweenBHelpers from "../KweenB/KweenBHelpers";
import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";
import { IHubServerInfo } from "@shared/interfaces";

export default class HubStreaming extends Streaming {
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
       * Step 2: Start Jacktrip HUB server on kweenb (take the cluster size into account)
       */

      let hubServerInfo: IHubServerInfo;
      try {
        this.sendInfo("Start Jacktrip HUB server on kweenb");
        hubServerInfo = await KweenBHelpers.startJacktripHubServer();
      } catch (e: any) {
        throw new Error(
          `Error while starting Jacktrip HUB server on kweenb: ${e.message}`
        );
      }

      /**
       * Step 3: Start Jack
       */

      try {
        this.sendInfo("Start Jack on kweenb");
        await KweenBHelpers.startJack();
      } catch (e: any) {
        throw new Error(`Error while starting Jack on kweenb: ${e.message}`);
      }

      /**
       * Step 4: Start the audio chain on the bees. Every bee connects to
       * the hub server and leads the stream into Pure Data itself.
       */

      await this.startStreamOnBees(
        activeBees,
        await Zwerm3ApiHelpers.createHubStreamRequest(hubServerInfo),
        "Jack, Jacktrip & Pure Data"
      );

      /**
       * Step 5: Connect every capture channel on kweenb to its bee
       */

      try {
        this.sendInfo("Make all audio connections on kweenb");
        await KweenBHelpers.makeHubAudioConnections(activeBees);
      } catch (e: any) {
        throw new Error(
          `Error while making audio connections on kweenb: ${e.message}`
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
