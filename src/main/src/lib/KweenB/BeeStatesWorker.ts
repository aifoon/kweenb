import BeeHelpers from "./BeeHelpers";
import { exec } from "node:child_process";
import { BeeActiveState } from "@shared/enums";
import {
  AUDIOSCENES_POLLING_SECONDS,
  AUDIOSCENES_REMOVING_SECONDS,
  BEE_POLLING_SECONDS,
  NETWORK_PERFORMANCE_POLLING_SECONDS,
} from "../../consts";
import { BeeStates } from "../Dictionaries";
import BeeSsh from "./BeeSsh";
import { resourcesPath } from "@shared/resources";
import { IBee, AudioSceneDbRecord, SshOutputState } from "@shared/interfaces";
import BeeSshScriptExecutor from "./BeeSshScriptExecutor";
import { logger, debug } from "../../logger";

// Import the audio scene model
import AudioSceneDb from "../../models/AudioScene";
import { HAS_CONNECTION_WITH_PHYSICAL_SWARM } from "@shared/consts";
import { Op } from "sequelize";

class BeeStatesWorker {
  private _beeStates: BeeStates;
  private _allBees: IBee[];
  private _updateBeeStatesInterval: NodeJS.Timeout;
  private _updateBeeNetworkPerformanceInterval: NodeJS.Timeout;
  private _updateAudioScenesInterval: NodeJS.Timeout;
  private _removingAudioScenesInterval: NodeJS.Timeout;
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

    if (!this._removingAudioScenesInterval) {
      this._removingAudioScenesInterval = setInterval(
        () => this.removeFlaggedAudioScenes(),
        AUDIOSCENES_REMOVING_SECONDS * 1000
      );
    }
  }

  /**
   * Stop the workers
   */
  public stopWorkers() {
    clearInterval(this._updateBeeStatesInterval);
    clearInterval(this._updateBeeNetworkPerformanceInterval);
    clearInterval(this._updateAudioScenesInterval);
    clearInterval(this._removingAudioScenesInterval);
  }

  /**
   * Updates the AudioScene table by comparing existing records with incoming data
   * @param incomingScenes Array of AudioScene data received from Raspberry Pi
   * @param beeId The ID of the Raspberry Pi
   * @returns Promise that resolves when all operations are complete
   */
  private async syncAudioScenes(
    incomingScenes: Omit<AudioSceneDbRecord, "id">[],
    beeId: number
  ) {
    try {
      // 1. Get all existing scenes for this specific beeId, including those marked for deletion
      const existingScenes = await AudioSceneDb.findAll({
        where: { beeId },
      });

      // 2. Create a map using localFolderPath and beeId as the composite key
      const existingSceneMap = new Map();
      existingScenes.forEach((scene) => {
        const compositeKey = `${scene.localFolderPath}_${scene.beeId}`;
        existingSceneMap.set(compositeKey, scene);
      });

      const scenesToCreate = [];
      const scenesToUpdate = [];
      const scenesToKeep = new Set();
      const recordsToDelete = [];

      // Create a set of incoming scene keys for quick lookup
      const incomingSceneKeys = new Set(
        incomingScenes.map((scene) => `${scene.localFolderPath}_${scene.beeId}`)
      );

      // Classify each incoming scene using the composite key
      for (const scene of incomingScenes) {
        const compositeKey = `${scene.localFolderPath}_${scene.beeId}`;
        const existingScene = existingSceneMap.get(compositeKey);

        if (!existingScene) {
          // Only create if not marked for deletion
          scenesToCreate.push({
            ...scene,
            manuallyAdded: false,
            markedForDeletion: false,
          });
        } else {
          // Skip if marked for deletion
          if (existingScene.markedForDeletion) {
            continue;
          }

          // Check if anything changed or if it was manually added
          const needsUpdate =
            existingScene.name !== scene.name ||
            existingScene.oscAddress !== scene.oscAddress ||
            existingScene.manuallyAdded === true;

          if (needsUpdate) {
            scenesToUpdate.push({
              id: existingScene.id,
              name: scene.name,
              oscAddress: scene.oscAddress,
              manuallyAdded: false,
              markedForDeletion: false,
            });
          }

          // Mark this scene as one to keep
          scenesToKeep.add(compositeKey);
        }
      }

      // Process existing scenes
      for (const scene of existingScenes) {
        const compositeKey = `${scene.localFolderPath}_${scene.beeId}`;

        // If a scene is marked for deletion AND it's no longer in the incoming scenes,
        // we can safely delete it permanently
        if (scene.markedForDeletion && !incomingSceneKeys.has(compositeKey)) {
          recordsToDelete.push(scene.id);
        }
        // If a scene is not marked manually added, not marked for deletion,
        // and not in the incoming scenes, mark it for deletion
        else if (
          !scene.manuallyAdded &&
          !scene.markedForDeletion &&
          !incomingSceneKeys.has(compositeKey)
        ) {
          recordsToDelete.push(scene.id);
        }
      }

      // 4. Execute all operations in parallel for better performance
      const operations = [];

      if (scenesToCreate.length > 0) {
        operations.push(AudioSceneDb.bulkCreate(scenesToCreate));
      }

      // Process updates individually
      for (const scene of scenesToUpdate) {
        operations.push(
          AudioSceneDb.update(
            {
              name: scene.name,
              oscAddress: scene.oscAddress,
              manuallyAdded: false,
              markedForDeletion: false,
            },
            { where: { id: scene.id } }
          )
        );
      }

      if (recordsToDelete.length > 0) {
        operations.push(
          AudioSceneDb.destroy({
            where: { id: { [Op.in]: recordsToDelete } },
          })
        );
      }

      await Promise.all(operations);

      return {
        created: scenesToCreate,
        updated: scenesToUpdate,
        deleted: recordsToDelete,
      };
    } catch (error) {
      console.error("Error syncing audio scenes:", error);
      throw error;
    }
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

            // Get only the online bees
            const onlineBees = states.filter((state) => state.isOnline);

            // If no online bees, return early
            if (onlineBees.length === 0) return;

            /**
             * @debug - This is spoofing the connection status
             */
            if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
              // Generate random network performance for all online bees
              onlineBees.forEach((state) => {
                const bee = this.beeStates.bees.find(
                  (bee) => bee.ipAddress === state.ipAddress
                );
                if (!bee) return;

                // Generate random network performance value between 1 and 5
                const randomNetworkPerformance = Math.random() * 4 + 1;
                this._beeStates.update(
                  "networkPerformanceMs",
                  bee,
                  parseFloat(randomNetworkPerformance.toFixed(2))
                );
              });
              return;
            }

            // Get only the IP addresses of online bees
            const onlineIpAddresses = onlineBees.map((bee) => bee.ipAddress);

            // Run parallel network performance check on all online bees
            exec(
              `${resourcesPath}/scripts/network_performance_multiple.sh ${onlineIpAddresses.join(
                " "
              )}`,
              (error, performanceData, stderr) => {
                if (error) {
                  console.error("Network performance check error:", error);
                  return;
                }

                try {
                  // Parse the performance data
                  const performanceResults = JSON.parse(
                    performanceData.toString().trim()
                  );

                  // Update the network performance for each bee
                  performanceResults.forEach((result: any) => {
                    const bee = this.beeStates.bees.find(
                      (bee) => bee.ipAddress === result.ipAddress
                    );

                    if (!bee) return;

                    // Update with the latency value (999.99 means failed check)
                    const latency =
                      result.latency >= 999 ? result.latency : result.latency;
                    this._beeStates.update(
                      "networkPerformanceMs",
                      bee,
                      latency
                    );
                  });
                } catch (e) {
                  console.error(
                    "Error processing network performance data:",
                    e
                  );
                }
              }
            );
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

            // @debug Uncomment if you want to see the debug info
            // this._beeStates.printDebugInfo();
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
  private async updateAudioScenes() {
    try {
      // validate
      if (!this._allBees) return;

      try {
        // execute the script
        const output =
          await this._beeSshScriptExecutor.executeWithOutput<string>(
            "get_audio_scenes.sh",
            this._allBees
          );

        // validate
        if (!output) return;

        interface AudioSceneOnBee {
          id: number;
          audioScenes: Omit<AudioSceneDbRecord, "id" | "beeId">[];
        }

        // parse the scenes
        const audioScenesOnBees = JSON.parse(output) as AudioSceneOnBee[];

        // Process scenes for each bee in parallel
        const syncPromises = audioScenesOnBees.map(async (audioSceneOnBee) => {
          // validate the audio scenes
          if (
            !audioSceneOnBee.audioScenes ||
            audioSceneOnBee.audioScenes.length === 0
          )
            return;

          // create the records for the database
          const audioScenesForDatabase: Omit<AudioSceneDbRecord, "id">[] = [];

          // loop through the audio scenes and prepare them for the database
          for (const audioScene of audioSceneOnBee.audioScenes) {
            audioScenesForDatabase.push({
              beeId: audioSceneOnBee.id,
              oscAddress: audioScene.oscAddress,
              name: audioScene.name,
              localFolderPath: audioScene.localFolderPath,
              manuallyAdded: audioScene.manuallyAdded,
            });
          }

          // sync the audio scenes with the database
          const result = await this.syncAudioScenes(
            audioScenesForDatabase,
            audioSceneOnBee.id
          );

          // Log the result
          if (debug("audioScenesSync")) {
            // log the result
            logger.group(
              "audioScenesSync",
              `Bee ${audioSceneOnBee.id} - Created: ${result.created.length}, Updated: ${result.updated.length}, Deleted: ${result.deleted.length}`,
              () => {
                // Log details of created records
                if (result.created.length > 0) {
                  logger.info("audioScenesSync", "  Created:");
                  result.created.forEach((scene) => {
                    logger.info(
                      "audioScenesSync",
                      `    - ${scene.name} (Path: ${scene.localFolderPath})`
                    );
                  });
                }

                // Log details of updated records
                if (result.updated.length > 0) {
                  logger.info("audioScenesSync", "  Updated:");
                  result.updated.forEach((scene) => {
                    logger.info("audioScenesSync", `    - ${scene.name}`);
                  });
                }

                // Log details of deleted records
                if (result.deleted.length > 0) {
                  logger.info(
                    "audioScenesSync",
                    "  Deleted IDs:",
                    result.deleted.join(", ")
                  );
                }
              }
            );
          }
        });

        // Wait for all sync operations to complete
        await Promise.all(syncPromises);
      } catch (error) {
        logger.error("audioScenesSync", "Error updating audio scenes:", error);
      }
    } catch (e) {
      logger.error("audioScenesSync", "Error updating audio scenes:", e);
    }
  }

  /**
   * Remove flagged audio scenes from the database
   */
  private async removeFlaggedAudioScenes() {
    try {
      // Get all audio scenes marked for deletion
      const scenesToDelete = await AudioSceneDb.findAll({
        where: { markedForDeletion: true },
      });

      // Delete the flagged scenes
      await AudioSceneDb.destroy({
        where: {
          id: {
            [Op.in]: scenesToDelete.map((scene) => scene.id),
          },
        },
      });
    } catch (error) {
      console.error(
        "audioScenesSync",
        "Error removing flagged audio scenes:",
        error
      );
    }
  }
}

export default BeeStatesWorker;
