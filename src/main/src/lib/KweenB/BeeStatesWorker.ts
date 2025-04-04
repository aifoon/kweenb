import BeeHelpers from "./BeeHelpers";
import { exec, spawn } from "node:child_process";
import { BeeActiveState } from "@shared/enums";
import {
  AUDIOSCENES_POLLING_SECONDS,
  BEE_POLLING_SECONDS,
  NETWORK_PERFORMANCE_POLLING_SECONDS,
} from "../../consts";
import { BeeStates } from "../Dictionaries";
import BeeSsh from "./BeeSsh";
import { resourcesPath } from "@shared/resources";
import { IBee, AudioScene } from "@shared/interfaces";
import BeeSshScriptExecutor from "./BeeSshScriptExecutor";

// Import the audio scene model
import AudioSceneDb from "../../models/AudioScene";
import { HAS_CONNECTION_WITH_PHYSICAL_SWARM } from "@shared/consts";

interface SshOutputState {
  ipAddress: string;
  responseTime: Date;
  isOnline: boolean;
}

class BeeStatesWorker {
  private _beeStates: BeeStates;
  private _allBees: IBee[];
  private _updateBeeStatesInterval: NodeJS.Timeout;
  private _updateBeeNetworkPerformanceInterval: NodeJS.Timeout;
  private _updateAudioScenesInterval: NodeJS.Timeout;
  private _beeSshScriptExecutor: BeeSshScriptExecutor;

  constructor() {
    this._allBees = [];
    this._beeStates = new BeeStates();
    this._beeSshScriptExecutor = new BeeSshScriptExecutor();
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
    this._allBees = await BeeHelpers.getAllBeesData(BeeActiveState.ALL);

    // loop through the bees
    this._beeStates.addBees(this._allBees);

    // start doing this in the background
    this.updateBeeStates();

    // do interval for fetching bee states
    if (!this._updateBeeStatesInterval)
      this._updateBeeStatesInterval = setInterval(() => {
        this.updateBeeStates();
      }, BEE_POLLING_SECONDS * 1000);

    // do interval for fetching bee network performance
    if (!this._updateBeeNetworkPerformanceInterval)
      this._updateBeeNetworkPerformanceInterval = setInterval(
        () => this.updateBeeNetworkPerformance(),
        NETWORK_PERFORMANCE_POLLING_SECONDS * 1000
      );

    // do interval for fetching audio scenes on the bees
    if (!this._updateAudioScenesInterval)
      this._updateAudioScenesInterval = setInterval(
        () => this.updateAudioScenes(),
        AUDIOSCENES_POLLING_SECONDS * 1000
      );
  }

  /**
   * Stop the workers
   */
  public stopWorkers() {
    clearInterval(this._updateBeeStatesInterval);
    clearInterval(this._updateBeeNetworkPerformanceInterval);
    clearInterval(this._updateAudioScenesInterval);
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
        `${resourcesPath}/scripts/is_online_multiple.sh ${ipAddresses.join(
          " "
        )}`,
        (error, onlineStatus, stderr) => {
          try {
            // convert the json
            const json = JSON.parse(onlineStatus.toString().trim());

            // get the output states
            let states: SshOutputState[] = json.map((state: SshOutputState) => {
              return {
                ipAddress: state.ipAddress,
                responseTime: new Date(state.responseTime),
                isOnline: state.isOnline,
              };
            });

            /**
             * @debug - This is spoofing the connection status
             */
            if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
              states = states.map((state) => ({
                ...state,
                isOnline: true,
              }));
            }

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
                 * @debug - This is spoofing the connection status
                 */
                if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
                  // Generate random network performance value between 1 and 5
                  const randomNetworkPerformance = Math.random() * 4 + 1;
                  this._beeStates.update(
                    "networkPerformanceMs",
                    bee,
                    parseFloat(randomNetworkPerformance.toFixed(2))
                  );
                  return;
                }

                // spawn a child process to check the network performance
                const childNetworkPerformance = spawn(
                  `${resourcesPath}/scripts/network_performance.sh`,
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
            console.error(e);
          }
        }
      );
    } catch (e) {
      console.error(e);
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
        `${resourcesPath}/scripts/is_online_multiple.sh ${ipAddresses.join(
          " "
        )}`,
        (error, onlineStatus, stderr) => {
          try {
            // convert the json
            const json = JSON.parse(onlineStatus.toString().trim());

            // get the output states
            let states: SshOutputState[] = json.map((state: SshOutputState) => {
              return {
                ipAddress: state.ipAddress,
                responseTime: new Date(state.responseTime),
                isOnline: state.isOnline,
              };
            });

            /**
             * @debug - This is spoofing the connection status
             */
            if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
              states = states.map((state) => ({
                ...state,
                isOnline: true,
              }));
            }

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
                 * @debug - This is spoofing the connection status
                 */
                if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
                  this._beeStates.update("isApiOn", bee, true);
                  this._beeStates.update("isJackRunning", bee, true);
                  this._beeStates.update("isJacktripRunning", bee, true);
                  return;
                }

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
            console.error(e);
          }
        }
      );
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Update the audio scenes
   */
  private updateAudioScenes() {
    try {
      // validate
      if (!this._allBees) return;

      // execute the script
      this._beeSshScriptExecutor
        .executeWithOutput<string>("get_audio_scenes.sh", this._allBees)
        .then((output) => {
          // log.info("KeyPath:");
          // log.info(beeSshScriptExecuter.privateKeyPath);
          // log.info("Bee:");
          // log.info(this._allBees);
          // log.info("Audio scenes output:");
          // log.info(output);

          // validate
          if (!output) return;

          // parse the scenes
          const audioScenesOnBees = JSON.parse(output);

          // create the records for the database
          const audioScenesForDatabase: any[] = [];
          audioScenesOnBees.forEach(({ id, audioScenes }: any) => {
            if (!audioScenes || audioScenes.length === 0) return;
            for (const audioScene of audioScenes) {
              audioScenesForDatabase.push({
                beeId: id,
                oscAddress: audioScene.oscAddress,
                name: audioScene.name,
                localFolderPath: audioScene.localFolderPath,
              });
            }
          });

          // create the audio scenes
          AudioSceneDb.bulkCreate(audioScenesForDatabase, {
            updateOnDuplicate: ["localFolderPath", "beeId"],
          })
            .then(() => {
              // get all the audio scenes from the database
              // AudioSceneDB.findAll().then((values) => {
              //   // get a list of audio scenes that are in the database but not in the new list
              //   const audioScenesToDelete = values.filter(
              //     (scene) =>
              //       !audioScenesForDatabase.some(
              //         (newScene) =>
              //           newScene.localFolderPath ===
              //             scene.dataValues.localFolderPath &&
              //           newScene.beeId === scene.dataValues.beeId
              //       )
              //   );
              //   // validate if there are any scenes to delete
              //   if (audioScenesToDelete.length === 0) return;
              //   // destroy the audio scenes
              //   AudioSceneDB.destroy({
              //     where: {
              //       [Op.or]: audioScenesToDelete.map((scene) => ({
              //         beeId: scene.beeId,
              //         localFolderPath: scene.localFolderPath,
              //       })),
              //     },
              //   });
              // });
            })
            .catch((e) => {
              // log.info(e);
              console.error(e);
            });
        });
    } catch (e) {
      // log.info(e);
      console.error(e);
    }
  }
}

export default BeeStatesWorker;
