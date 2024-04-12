import BeeHelpers from "./BeeHelpers";
import { exec, spawn, spawnSync } from "node:child_process";
import { BeeActiveState } from "@shared/enums";
import {
  BEE_POLLING_SECONDS,
  NETWORK_PERFORMANCE_POLLING_SECONDS,
} from "../../consts";
import { BeeStates } from "../Dictionaries";
import BeeSsh from "./BeeSsh";

interface SshOutputState {
  ipAddress: string;
  responseTime: Date;
  isOnline: boolean;
}

class BeeStatesWorker {
  private _beeStates: BeeStates;
  private _updateBeeStatesInterval: NodeJS.Timer;
  private _updateBeeNetworkPerformanceInterval: NodeJS.Timer;

  constructor() {
    this._beeStates = new BeeStates();
  }

  /**
   * Get the bee states
   */
  public get beeStates() {
    return this._beeStates;
  }

  /**
   * Initialize the bee states
   */
  public async init() {
    // get all the bees
    const bees = await BeeHelpers.getAllBeesData(BeeActiveState.ALL);

    // loop through the bees
    this._beeStates.addBees(bees);

    // get the bee states
    this.updateBeeStates();

    // do interval for fetching bee states
    this._updateBeeStatesInterval = setInterval(
      () => this.updateBeeStates(),
      BEE_POLLING_SECONDS * 1000
    );

    // do interval for fetching bee network performance
    this._updateBeeNetworkPerformanceInterval = setInterval(
      () => this.updateBeeNetworkPerformance(),
      NETWORK_PERFORMANCE_POLLING_SECONDS * 1000
    );
  }

  /**
   * Stop the workers
   */
  public stopWorkers() {
    clearInterval(this._updateBeeStatesInterval);
    clearInterval(this._updateBeeNetworkPerformanceInterval);
  }

  /**
   * Update the bee network performance in the internal table
   */
  private updateBeeNetworkPerformance() {
    // map the ip addresses
    const ipAddresses = this._beeStates.bees.map((bee) => bee.ipAddress);

    // do an ssh check on the bees
    try {
      // spawn a child process to check if the bees are online
      exec(
        `utils/is_online_multiple.sh ${ipAddresses.join(" ")}`,
        (error, onlineStatus, stderr) => {
          try {
            // convert the json
            const json = JSON.parse(onlineStatus.toString().trim());

            // get the output states
            const states: SshOutputState[] = json.map(
              (state: SshOutputState) => {
                return {
                  ipAddress: state.ipAddress,
                  responseTime: new Date(state.responseTime),
                  isOnline: state.isOnline,
                };
              }
            );

            // loop over the states that are online
            states
              .filter((state) => state.isOnline)
              .forEach((state) => {
                // get the bee
                const bee = this.beeStates.bees.find(
                  (bee) => bee.ipAddress === state.ipAddress
                );

                // validate
                if (!bee) return;

                // spawn a child process to check the network performance
                const childNetworkPerformance = spawn(
                  "utils/network_performance.sh",
                  [state.ipAddress]
                );

                childNetworkPerformance.stdout.on(
                  "data",
                  (networkPerformance) => {
                    this._beeStates.update(
                      "networkPerformanceMs",
                      bee,
                      parseFloat(networkPerformance.toString().trim())
                    );
                  }
                );
              });
          } catch (e) {
            // console.error(e);
          }
        }
      );
    } catch (e) {
      // console.error(e);
    }
  }

  /**
   * Refresh the bee states
   */
  private updateBeeStates() {
    // map the ip addresses
    const ipAddresses = this._beeStates.bees.map((bee) => bee.ipAddress);

    // do an ssh check on the bees
    try {
      // spawn a child process to check if the bees are online
      exec(
        `utils/is_online_multiple.sh ${ipAddresses.join(" ")}`,
        (error, onlineStatus, stderr) => {
          try {
            // convert the json
            const json = JSON.parse(onlineStatus.toString().trim());

            // get the output states
            const states: SshOutputState[] = json.map(
              (state: SshOutputState) => {
                return {
                  ipAddress: state.ipAddress,
                  responseTime: new Date(state.responseTime),
                  isOnline: state.isOnline,
                };
              }
            );

            // loop over the states that are online
            states
              .filter((state) => state.isOnline)
              .forEach((state) => {
                // get the bee
                const bee = this.beeStates.bees.find(
                  (bee) => bee.ipAddress === state.ipAddress
                );

                // validate
                if (!bee) return;

                /**
                 * Update the last ping response
                 */
                this._beeStates.update(
                  "lastPingResponse",
                  bee,
                  state.responseTime
                );

                /**
                 * Check if the Zwerm3 API is running
                 */
                BeeSsh.isZwerm3ApiRunning(state.ipAddress).then(
                  (isApiOn: boolean) => {
                    this._beeStates.update("isApiOn", bee, isApiOn);
                  }
                );

                /**
                 * Check if Jack is running
                 */
                BeeSsh.isJackRunning(state.ipAddress).then(
                  (isJackRunning: boolean) => {
                    this._beeStates.update("isJackRunning", bee, isJackRunning);
                  }
                );

                /**
                 * Check if Jacktrip is running
                 */
                BeeSsh.isJacktripRunning(state.ipAddress).then(
                  (isJacktripRunning: boolean) => {
                    this._beeStates.update(
                      "isJacktripRunning",
                      bee,
                      isJacktripRunning
                    );
                  }
                );
              });
          } catch (e) {
            // console.error(e);
          }
        }
      );
    } catch (e) {
      // console.error(e);
    }
  }
}

export default BeeStatesWorker;
