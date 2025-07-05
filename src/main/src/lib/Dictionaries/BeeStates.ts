import { IBee, IBeeState } from "@shared/interfaces";
import { Utils } from "@shared/utils";
import { BEE_CONSIDERED_OFFLINE_SECONDS } from "../../consts";

class BeeStates {
  private beeStates: IBeeState[];

  constructor() {
    this.beeStates = [];
  }

  /**
   * Adds a bee to the bee states
   * @param bee
   */
  public addBees(bees: IBee[]) {
    bees.forEach((bee) => {
      this.beeStates.push({
        bee,
        lastPingResponse: null,
        isApiOn: false,
        isJackRunning: false,
        isJacktripRunning: false,
        networkPerformanceMs: 0,
        isOnline: false,
      });
    });
  }

  /**
   * Clear the bee states
   */
  public clear() {
    this.beeStates = [];
  }

  /**
   * Print debug info
   */
  public printDebugInfo(beeNumbers: number[] | null = null) {
    const printBeeStateInfo = (beeState: IBeeState) => {
      console.log(
        `${beeState.bee.name} - ${
          this.isOnline(beeState.bee) ? "Online" : "Offline"
        } - ${this.isApiOn(beeState.bee) ? "Api ON" : "Api OFF"} - ${
          this.isJackRunning(beeState.bee) ? "Jack ON" : "Jack OFF"
        } - ${
          this.isJacktripRunning(beeState.bee) ? "Jacktrip ON" : "Jacktrip OFF"
        } - Network Perf.: ${
          this.getNetworkPerformanceMs(beeState.bee) || 0
        }ms - Last Ping Resp.: ${this.convertPingResponseIntoReadable(
          beeState.lastPingResponse
        )}`
      );
    };

    if (beeNumbers && beeNumbers.length > 0) {
      const filteredBeeStates = this.beeStates.filter((beeState) =>
        beeNumbers.includes(beeState.bee.id)
      );
      filteredBeeStates.forEach((beeState) => {
        printBeeStateInfo(beeState);
      });
    } else {
      this.beeStates.forEach((beeState) => {
        printBeeStateInfo(beeState);
      });
    }
  }

  /**
   * Get the bees array
   */
  public get bees() {
    return this.beeStates.map((beeState) => beeState.bee);
  }

  /**
   * Get the bee from the bee states
   */
  private getBee(bee: IBee | number | null) {
    // return null if the bee is null or 0
    if (!bee || bee === 0) return null;

    // store the bee in a variable
    const internalBee =
      typeof bee === "number"
        ? this.beeStates.find((b) => b.bee.id === bee)?.bee
        : bee;

    // validate the bee
    if (!internalBee) return null;

    // return the bee
    return internalBee;
  }

  /**
   * Get the bee state of a bee
   */
  public getBeeState(bee: IBee) {
    return this.beeStates.find((b) => b.bee.id === bee.id);
  }

  /**
   * Get the online bees
   * @description Returns an array of bees that are online
   * @returns
   */
  public getBeesWithOnlineState() {
    return this.beeStates.filter((b) => this.isOnline(b.bee));
  }

  /**
   * Converts the ping response into a readable format
   * @param date The date to convert
   * @returns The readable date
   */
  public convertPingResponseIntoReadable(date: Date | null) {
    try {
      // Check if date is null
      if (!date) {
        return "No ping response";
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date format";
      }

      // Format to HH:mm:ss
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return `Error converting time: ${errorMessage}`;
    }
  }

  /**
   * Check if a bee is online
   * @param bee The bee
   * @returns Boolean
   */
  public isOnline(bee: IBee | number) {
    // get the bee
    const internalBee = this.getBee(bee);

    // return false if the bee is null
    if (!internalBee) return false;

    // get the bee state
    const beeState = this.getBeeState(internalBee);

    // return false if the bee state is null
    if (!beeState) return false;

    // return true if the bee is online
    return beeState.isOnline;
  }

  /**
   * Is the api on
   * @param bee The bee (as a number or an IBee object)
   * @returns Boolean
   */
  public isApiOn(bee: IBee | number) {
    const validBeeState = this.validBeeState(bee);
    return validBeeState ? validBeeState.isApiOn : false;
  }

  /**
   * Is Jack running
   * @param bee The bee (as a number or an IBee object)
   * @returns Boolean
   */
  public isJackRunning(bee: IBee | number) {
    const validBeeState = this.validBeeState(bee);
    return validBeeState ? validBeeState.isJackRunning : false;
  }

  /**
   * Is Jacktrip running
   * @param bee The bee (as a number or an IBee object)
   * @returns Boolean
   */
  public isJacktripRunning(bee: IBee | number) {
    const validBeeState = this.validBeeState(bee);
    return validBeeState ? validBeeState.isJacktripRunning : false;
  }

  /**
   * Get the network performance in ms
   * @param bee The bee (as a number or an IBee object)
   * @returns Boolean
   */
  public getNetworkPerformanceMs(bee: IBee | number) {
    const validBeeState = this.validBeeState(bee);
    return validBeeState ? validBeeState.networkPerformanceMs : 0;
  }

  /**
   * Update the last ping response
   * @param bee The bee
   * @param pingResponse Boolean
   */
  public update(
    type:
      | "lastPingResponse"
      | "isApiOn"
      | "isJackRunning"
      | "isJacktripRunning"
      | "networkPerformanceMs"
      | "isOnline",
    bee: IBee,
    value: Date | boolean | number = false
  ) {
    const beeState = this.getBeeState(bee);
    if (beeState) {
      switch (type) {
        case "lastPingResponse":
          beeState.lastPingResponse = value as Date;
          break;
        case "isApiOn":
          beeState.isApiOn = value as boolean;
          break;
        case "isJackRunning":
          beeState.isJackRunning = value as boolean;
          break;
        case "isJacktripRunning":
          beeState.isJacktripRunning = value as boolean;
          break;
        case "isOnline":
          beeState.isOnline = value as boolean;
          break;
        case "networkPerformanceMs":
          beeState.networkPerformanceMs = (value as number)
            ? (value as number)
            : 0;
          break;
        default:
          break;
      }
    }
  }

  /**
   * Get a valid bee state of a specific bee
   * @param bee
   * @returns
   */
  private validBeeState(bee: IBee | number): IBeeState | null {
    // get the bee
    const internalBee = this.getBee(bee);

    // return false if the bee is null or if the bee is offline
    if (!internalBee || !this.isOnline(internalBee)) return null;

    // get the bee state
    const beeState = this.getBeeState(internalBee);

    // return false if the bee state is null
    if (!beeState) return null;

    // return true if the bee is valid
    return beeState;
  }

  /**
   * Remove a bee from the bee states
   * @param bee The bee to remove
   */
  public removeBee(bee: IBee | number) {
    const internalBee = this.getBee(bee);
    this.beeStates = this.beeStates.filter((b) => b.bee.id !== internalBee?.id);
  }
}

export default BeeStates;
