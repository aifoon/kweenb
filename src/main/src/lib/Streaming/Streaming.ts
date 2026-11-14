import { IBee, StreamingConnectionStatus } from "@shared/interfaces";
import { StreamingConnectionStatusType } from "@shared/enums";
import KweenBHelpers from "../KweenB/KweenBHelpers";
import BeeHelpers from "../KweenB/BeeHelpers";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";
import { SpeakerStreamRequest } from "../KweenB/SpeakerApi";
import { BeeActiveState } from "@shared/enums";

/**
 * Abstract class for streaming operations
 */
export default abstract class Streaming {
  private _onLoggingEvent: (
    streamConnectionStatus: StreamingConnectionStatus
  ) => void;

  constructor(
    onLoggingEvent: (streamConnectionStatus: StreamingConnectionStatus) => void
  ) {
    this._onLoggingEvent = onLoggingEvent;
  }

  sendInfo(
    message: string,
    type: StreamingConnectionStatusType = StreamingConnectionStatusType.INFO
  ) {
    this._onLoggingEvent({
      type,
      message,
    });
  }

  sendError(message: string) {
    this._onLoggingEvent({
      type: StreamingConnectionStatusType.ERROR,
      message,
    });
  }

  sendSuccess() {
    this._onLoggingEvent({
      type: StreamingConnectionStatusType.SUCCES,
      message: "",
    });
  }

  /**
   * Start the audio chain (Jack, Jacktrip and Pure Data) on the bees.
   * One call per bee: the bee starts everything, makes its own audio
   * connection and answers when sound can pass. A start replaces whatever
   * was running on the bee.
   * @param bees The bees
   * @param streamRequest What to start
   * @param what What is started, for the messages
   */
  protected async startStreamOnBees(
    bees: IBee[],
    streamRequest: SpeakerStreamRequest,
    what: string
  ) {
    try {
      this.sendInfo(`Start ${what} on active bees`);
      await Zwerm3ApiHelpers.startStreamOnBees(bees, streamRequest);
    } catch (e: any) {
      // the message names every bee that failed, with its own reason
      throw new Error(`Error while starting ${what} on bees. ${e.message}`);
    }
  }

  /**
   * Get the active bees, an error when there are none
   */
  protected async fetchActiveBees(): Promise<IBee[]> {
    try {
      this.sendInfo("Fetching active bees");
      const activeBees = await BeeHelpers.getAllBees(BeeActiveState.ACTIVE);
      if (!activeBees || activeBees.length === 0) {
        throw new Error(
          "No active bees found. Please make sure you have at least one active bee."
        );
      }
      return activeBees;
    } catch (e: any) {
      throw new Error(`Error while fetching active bees: ${e.message}`);
    }
  }

  /**
   * Kill the Jack & Jacktrip processes on kweenb
   */
  protected async killJackAndJacktripOnKweenB() {
    try {
      this.sendInfo("Killing Jack & Jacktrip processes on kweenb");
      await KweenBHelpers.killJackAndJacktrip();
    } catch (e: any) {
      throw new Error(
        `Error while killing Jack & Jacktrip processes on kweenb: ${e.message}`
      );
    }
  }

  protected async preConnectionCheck(): Promise<IBee[]> {
    /**
     * Step 1: Check if Jack & Jacktrip is installed on kweenb
     */

    try {
      this.sendInfo("Check if Jack & Jacktrip is installed on kweenb");
      const isJackAndJacktripInstalled =
        KweenBHelpers.isJackAndJacktripInstalled();
      if (!isJackAndJacktripInstalled) {
        throw new Error(
          "Jack & Jacktrip is not installed on kweenb. Please install it first."
        );
      }
    } catch (e: any) {
      throw new Error(
        `Error while checking if Jack & Jacktrip is installed on kweenb: ${e.message}`
      );
    }

    /**
     * Step 2: Fetch active bees
     */

    const activeBees = await this.fetchActiveBees();

    /**
     * Step 3: Check if every active bee is alive. A bee tells its status
     * itself (see BeeStatesWorker), so what we know is at most seconds old.
     */

    try {
      this.sendInfo("Check if every active bee is alive");
      const offlineBees = activeBees.filter(
        (bee) => !bee.isOnline || !bee.isApiOn
      );
      if (offlineBees.length > 0) {
        throw new Error(
          `Some bees are offline, please check your network: ${offlineBees
            .map((bee) => bee.name)
            .join(", ")}`
        );
      }
    } catch (e: any) {
      throw new Error(
        `Error while checking if active bees are alive: ${e.message}`
      );
    }

    /**
     * Step 4: Kill Jack & Jacktrip processes on kweenb (the bees replace
     * what is running themselves when they are started)
     */

    await this.killJackAndJacktripOnKweenB();

    /**
     * Return the result
     */

    return activeBees;
  }

  /**
   * Start connecting the streaming
   */
  protected abstract handleConnect(): Promise<void>;
}
