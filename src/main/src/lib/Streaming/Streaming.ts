import {
  IBee,
  StreamingConnectionStatus,
  SshOutputState,
} from "@shared/interfaces";
import { StreamingConnectionStatusType } from "@shared/enums";
import KweenBHelpers from "../KweenB/KweenBHelpers";
import BeeHelpers from "../KweenB/BeeHelpers";
import { BeeActiveState } from "@shared/enums";
import BeeSsh from "../KweenB/BeeSsh";
import { Utils } from "@shared/utils";
import { exec } from "child_process";
import { resourcesPath } from "@shared/resources";

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

  protected async makeAudioConnection(bees: IBee[]) {
    try {
      this.sendInfo("Make audio connection on active bees");
      await BeeHelpers.makeAudioConnection(bees);
    } catch (e: any) {
      throw new Error(
        `Error while making audio connection on active bees: ${e.message}`
      );
    }
  }

  protected async startPureData(bees: IBee[]) {
    try {
      this.sendInfo("Start Pure Data on active bees");
      const startPureDataPromises = bees.map((bee) => {
        BeeSsh.startPureData(bee.ipAddress);
      });

      // start pure data on active bees
      await Promise.all(startPureDataPromises);

      // an artificial delay to let Pure Data start
      await Utils.delay(2000);
    } catch (e: any) {
      throw new Error(
        `Error while starting Jack & Jacktrip clients on bees: ${e.message}`
      );
    }
  }

  protected async preConnectionCheck(): Promise<IBee[]> {
    /**
     * Init variables
     */

    let activeBees: IBee[] = [];

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

    try {
      this.sendInfo("Fetching active bees");
      activeBees = await BeeHelpers.getAllBees(BeeActiveState.ACTIVE);
      if (!activeBees || activeBees.length === 0) {
        throw new Error(
          "No active bees found. Please make sure you have at least one active bee."
        );
      }
    } catch (e: any) {
      throw new Error(`Error while fetching active bees: ${e.message}`);
    }

    /**
     * Step 3: Realtime check to see if every active bee is alive
     */

    try {
      this.sendInfo("Realtime check to see if every active bee is alive");
      if (!(await BeeHelpers.isOnlineMultiple(activeBees))) {
        throw new Error("Some bees are offline, please check your network");
      }
    } catch (e: any) {
      throw new Error(
        `Error while checking if active bees are alive: ${e.message}`
      );
    }

    /**
     * Step 4: Check if zwerm3 API is running on active bees
     */

    try {
      this.sendInfo("Check if zwerm3 API is running on active bees");
      const hasBeesWithoutZwerm3ApiRunning =
        activeBees.filter((bee) => !bee.isApiOn).length > 0;
      if (hasBeesWithoutZwerm3ApiRunning) {
        throw new Error(
          "One or more active bees are not responding. Please check your network connection."
        );
      }
    } catch (e: any) {
      throw new Error(
        `Error while checking if zwerm3 API is running on active bees: ${e.message}`
      );
    }

    /**
     * Step 5: Kill Jack & Jacktrip processes on active bees
     */

    try {
      this.sendInfo("Killing Jack & Jacktrip processes on active bees");
      const killAllProcessesPromises = activeBees.map((bee) =>
        BeeSsh.killJackAndJacktrip(bee.ipAddress)
      );
      await Promise.all(killAllProcessesPromises);
    } catch (e: any) {
      throw new Error(
        `Error while killing Jack & Jacktrip processes on active bees: ${e.message}`
      );
    }

    /**
     * Step 6: Kill Jack & Jacktrip processes on kweenb
     */

    try {
      this.sendInfo("Killing Jack & Jacktrip processes on kweenb");
      await KweenBHelpers.killJackAndJacktrip();
    } catch (e: any) {
      throw new Error(
        `Error while killing Jack & Jacktrip processes on active bees: ${e.message}`
      );
    }

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
