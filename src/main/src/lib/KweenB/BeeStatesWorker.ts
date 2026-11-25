import BeeHelpers from "./BeeHelpers";
import { BeeActiveState } from "@shared/enums";
import {
  AUDIO_FILES_ROOT_DIRECTORY,
  AUDIOSCENES_POLLING_SECONDS,
  AUDIOSCENES_REMOVING_SECONDS,
  BEE_CONSIDERED_OFFLINE_SECONDS,
} from "../../consts";
import { BeeStates } from "../Dictionaries";
import { IBee, AudioSceneDbRecord } from "@shared/interfaces";
import SpeakerApi, { isClockOff } from "./SpeakerApi";
import SwarmMonitor from "./SwarmMonitor";

// Import the audio scene model
import AudioSceneDb from "../../models/AudioScene";
import { Op } from "sequelize";

// how often we look if every bee is still followed and still talking
const BEE_WATCH_INTERVAL_MS = 1000;

/**
 * A bee we follow: the bee sends its status over a connection that stays open
 */
interface FollowedBee {
  ipAddress: string;
  stop: () => void;
}

class BeeStatesWorker {
  private _beeStates: BeeStates;
  private _followedBees: Map<number, FollowedBee>;
  // when we last told a bee the time
  private _clockSetAt = new Map<number, number>();
  // what happened to the swarm while KweenB runs
  private _monitor = new SwarmMonitor();
  private _watchBeesInterval: NodeJS.Timeout;
  private _updateAudioScenesInterval: NodeJS.Timeout;
  private _pauseUpdateAudioScenes: boolean;
  private _removingAudioScenesInterval: NodeJS.Timeout;
  private _isUpdatingAudioScenes = false;

  constructor() {
    this._beeStates = new BeeStates();
    this._followedBees = new Map();
    this._pauseUpdateAudioScenes = true;
  }

  /**
   * How the swarm is doing while KweenB runs
   */
  public get monitor() {
    return this._monitor;
  }

  /**
   * Get the bee states
   */
  public get beeStates() {
    return this._beeStates;
  }

  /**
   * Pause the update of audio scenes
   */
  public set pauseUpdateAudioScenes(value: boolean) {
    this._pauseUpdateAudioScenes = value;
  }

  /**
   * Get the pause update of audio scenes
   */
  public get pauseUpdateAudioScenes() {
    return this._pauseUpdateAudioScenes;
  }

  /**
   * Initialize the bee states
   */
  public async init() {
    // get all the bees
    const allBees = await BeeHelpers.getAllBeesData(BeeActiveState.ALL);

    // loop through the bees
    this._beeStates.addBees(allBees);

    // start following the bees right away
    this.watchBees();

    // keep following the bees that are known and notice the ones that went silent
    if (!this._watchBeesInterval)
      this._watchBeesInterval = setInterval(() => {
        this.watchBees();
      }, BEE_WATCH_INTERVAL_MS);

    // do interval for fetching audio scenes on the bees
    if (!this._updateAudioScenesInterval)
      this._updateAudioScenesInterval = setInterval(() => {
        this.updateAudioScenes();
      }, AUDIOSCENES_POLLING_SECONDS * 1000);

    if (!this._removingAudioScenesInterval) {
      this._removingAudioScenesInterval = setInterval(() => {
        this.removeFlaggedAudioScenes();
      }, AUDIOSCENES_REMOVING_SECONDS * 1000);
    }
  }

  /**
   * Stop the workers
   */
  public stopWorkers() {
    clearInterval(this._watchBeesInterval);
    clearInterval(this._updateAudioScenesInterval);
    clearInterval(this._removingAudioScenesInterval);
    this._followedBees.forEach((followedBee) => followedBee.stop());
    this._followedBees.clear();
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
   * Tell a bee the time when its clock is off: a bee has no internet and
   * forgets the time when it is switched off.
   */
  private keepClockRight(beeId: number, ipAddress: string, time?: string) {
    if (!isClockOff(time)) return;
    // one try at a time, and not more often than every 30 seconds
    const lastTry = this._clockSetAt.get(beeId) || 0;
    if (Date.now() - lastTry < 30000) return;
    this._clockSetAt.set(beeId, Date.now());
    SpeakerApi.setTime(ipAddress).catch((e) =>
      console.error(`Setting the clock of bee ${beeId} failed: ${e.message}`)
    );
  }

  /**
   * Follow every known bee and mark the bees that went silent as offline.
   * A bee tells its status itself (see SpeakerApi.followStatus), so there is
   * nothing to ask: a bee is online as long as its messages arrive.
   */
  private watchBees() {
    const bees = this._beeStates.bees;

    // stop following the bees that were removed or that changed address
    this._followedBees.forEach((followedBee, beeId) => {
      const bee = bees.find((b) => b.id === beeId);
      if (!bee || bee.ipAddress !== followedBee.ipAddress) {
        followedBee.stop();
        this._followedBees.delete(beeId);
        if (bee) {
          this._beeStates.setOffline(bee);
          this._monitor.reportOffline(bee.id, bee.name);
        } else this._monitor.forget(beeId);
      }
    });

    bees.forEach((bee) => {
      // start following the bees we do not follow yet
      if (!this._followedBees.has(bee.id)) {
        const beeId = bee.id;
        this._followedBees.set(beeId, {
          ipAddress: bee.ipAddress,
          stop: SpeakerApi.followStatus(bee.ipAddress, (status) => {
            // look the bee up again: it could be changed or removed meanwhile
            const currentBee = this._beeStates.bees.find((b) => b.id === beeId);
            if (currentBee) {
              this._beeStates.updateFromStatus(currentBee, status);
              const beeState = this._beeStates.getBeeState(currentBee);
              if (beeState)
                this._monitor.reportStatus(beeId, currentBee.name, {
                  stream: {
                    ...beeState.stream,
                    runningSeconds: status.stream?.runningSeconds,
                  },
                  battery: beeState.battery,
                  wifiSignalDbm: beeState.wifiSignalDbm,
                  wifiFrequencyMhz: beeState.wifiFrequencyMhz,
                  outputLevelDb: beeState.outputLevelDb,
                  network: status.network,
                });
            }
            this.keepClockRight(beeId, bee.ipAddress, status.time);
          }),
        });
      }

      // a bee that is silent for too long is offline
      const beeState = this._beeStates.getBeeState(bee);
      if (
        beeState?.isOnline &&
        (!beeState.lastPingResponse ||
          Date.now() - beeState.lastPingResponse.getTime() >
            BEE_CONSIDERED_OFFLINE_SECONDS * 1000)
      ) {
        this._beeStates.setOffline(bee);
        this._monitor.reportOffline(bee.id, bee.name);
      }
    });
  }

  /**
   * Update the audio scenes
   */
  private async updateAudioScenes() {
    // if paused, skip
    if (this._pauseUpdateAudioScenes) return;

    // the previous round is still busy
    if (this._isUpdatingAudioScenes) return;
    this._isUpdatingAudioScenes = true;

    try {
      // only the online bees can tell which scenes they have
      const onlineBees = this._beeStates
        .getBeesWithOnlineState()
        .map((beeState) => beeState.bee);

      // Process scenes for each bee in parallel
      const syncPromises = onlineBees.map(async (bee: IBee) => {
        try {
          // ask the bee for its scenes
          const scenes = await SpeakerApi.getScenes(bee.ipAddress);

          // paused while we were waiting (an upload or delete started)
          if (this._pauseUpdateAudioScenes) return;

          // create the records for the database
          const audioScenesForDatabase: Omit<AudioSceneDbRecord, "id">[] =
            scenes.map((scene) => ({
              beeId: bee.id,
              oscAddress: scene.oscAddress,
              name: scene.name,
              // the database knows a scene by this path; on the bee only
              // the last part (the legal name) has a meaning
              localFolderPath: `${AUDIO_FILES_ROOT_DIRECTORY}/${scene.legalName}`,
              manuallyAdded: false,
            }));

          // sync the audio scenes with the database
          await this.syncAudioScenes(audioScenesForDatabase, bee.id);
        } catch (error) {
          // one bee that does not answer does not stop the others
          console.error(`Error updating audio scenes of bee ${bee.id}:`, error);
        }
      });

      // Wait for all sync operations to complete
      await Promise.all(syncPromises);
    } catch (e) {
      console.error("Error updating audio scenes:", e);
    } finally {
      this._isUpdatingAudioScenes = false;
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
