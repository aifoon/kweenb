/**
 * A module with all the kweenb data stuff
 */

import fs from "fs";
import {
  AudioFile,
  AudioUploadStatusInfo,
  IBee,
  IBeeInput,
} from "@shared/interfaces";
import { Utils } from "@shared/utils";
import {
  AudioUploadStatus,
  BeeActiveState,
  BeeDeviceManagerActions,
  PDAudioParam,
} from "@shared/enums";
import { KweenBGlobal } from "../kweenb";
import zwerm3ApiHelpers from "../lib/KweenB/Zwerm3ApiHelpers";
import SpeakerApi, { SpeakerApiError } from "../lib/KweenB/SpeakerApi";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import {
  AUDIO_FILES_ROOT_DIRECTORY,
  DISK_REMAINING_ON_BEE_TRESHOLD_MB,
} from "../consts";

// Import models
import AudioScene from "../models/AudioScene";
import Bee from "../models/Bee";

/**
 * Cancel the current upload operation
 */
export const cancelUploadAudioFiles = async (
  event: Electron.IpcMainInvokeEvent
): Promise<void> => {
  if (KweenBGlobal.kweenb.currentUploadOperation) {
    KweenBGlobal.kweenb.currentUploadOperation.cancelled = true;

    // Stop the upload that is on its way
    if (KweenBGlobal.kweenb.currentUploadOperation.abort) {
      try {
        KweenBGlobal.kweenb.currentUploadOperation.abort();
      } catch (e) {
        // Ignore errors when stopping
      }
    }
  }
};

/**
 * Create a new bee
 * @param event The invoke event
 * @param bee
 */
export const createBee = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBeeInput
): Promise<IBee> => {
  try {
    // validate bee number
    const beeNumberExists = await Bee.findOne({ where: { id: bee.id } });
    if (beeNumberExists)
      throw new Error(
        `A bee with the number ${Utils.addLeadingZero(bee.id)} already exists.`
      );

    // validate bee ip address
    const beeIpAddressExists = await Bee.findOne({
      where: { ipAddress: bee.ipAddress },
    });
    if (beeIpAddressExists)
      throw new Error(
        `A bee with the ip address ${bee.ipAddress} already exists.`
      );

    // create a new bee
    const createdBee = await BeeHelpers.createBee(bee);

    // because bees in the worker are initialize at startup, we need to append this manually
    KweenBGlobal.kweenb.beeStates.addBees([createdBee]);

    // show confirmation when bee was added
    KweenBGlobal.kweenb.showSuccess(
      `Bee ${Utils.addLeadingZero(createdBee.id)} was created successfully.`
    );

    // return the created bee
    return createdBee;
  } catch (e: any) {
    throw new KweenBException(
      { where: "createBee()", message: e.message },
      true
    );
  }
};

/**
 * Delete a bee in database
 * @param event
 * @param id
 */
export const deleteBee = (event: Electron.IpcMainInvokeEvent, id: number) => {
  try {
    // remove the bee in the database
    Bee.destroy({ where: { id } });

    // remove the bee in the worker
    KweenBGlobal.kweenb.beeStates.removeBee(id);

    // show confirmation when bee was deleted
    KweenBGlobal.kweenb.showInfo(
      `Bee ${Utils.addLeadingZero(id)} was deleted successfully.`
    );
  } catch (e: any) {
    throw new KweenBException({ where: "deleteBee()", message: e.message });
  }
};

/**
 * Delete a file on the client
 * @param event The invoke event
 * @param path The path of the file
 */
export const deleteAudio = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee,
  path: string,
  deleteOnAllBees: boolean = false
) => {
  try {
    if (!path.startsWith(AUDIO_FILES_ROOT_DIRECTORY)) return;

    // the bee knows the scene by the last part of the path (its legal name)
    const legalName = path.substring(path.lastIndexOf("/") + 1);
    if (!legalName) return;

    // delete on all online bees or only on the given bee
    const bees = deleteOnAllBees
      ? (await BeeHelpers.getAllBees(BeeActiveState.ALL)).filter(
          (onlineBee) => onlineBee.isOnline
        )
      : [bee];

    // remove the scene on the bees
    const failures = await zwerm3ApiHelpers.onBees(bees, async (currentBee) => {
      try {
        await SpeakerApi.deleteScene(currentBee.ipAddress, legalName);
      } catch (e: any) {
        // a scene that is not on this bee is as good as removed
        if (!(e instanceof SpeakerApiError && e.statusCode === 404)) throw e;
      }

      // remove the scene in the database
      await AudioScene.update(
        { markedForDeletion: true },
        { where: { localFolderPath: path, beeId: currentBee.id } }
      );
    });

    // name the bees on which the scene could not be removed
    if (failures.length > 0)
      throw new Error(zwerm3ApiHelpers.describeFailures(failures));
  } catch (e: any) {
    throw new KweenBException(
      { where: "deleteFile()", message: e.message },
      true
    );
  }
};

/**
 * Fetch all the bees
 * @returns A Promise that will result an object of format IBee
 */
export const fetchAllBees = async (): Promise<IBee[]> => {
  try {
    return await BeeHelpers.getAllBees(BeeActiveState.ALL);
  } catch (e: any) {
    throw new KweenBException({ where: "fetchAllBees()", message: e.message });
  }
};

/**
 * Fetching a bee based on the ID
 * @param id The id of the bee to be found
 * @returns an object shaped like an IBee
 */
export const fetchBee = async (
  event: Electron.IpcMainInvokeEvent,
  id: number
): Promise<IBee> => {
  try {
    return await BeeHelpers.getBee(id);
  } catch (e: any) {
    throw new KweenBException(
      { where: "fetchBee()", message: e.message },
      true
    );
  }
};

/**
 * Get the audio files on the client
 * @param event
 * @param bee
 */
export const getAudioFiles = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
): Promise<AudioFile[]> => {
  try {
    // every scene on the bee is a folder with the audio and its data
    const scenes = await SpeakerApi.getScenes(bee.ipAddress);
    return scenes.map((scene) => {
      const fullPath = `${AUDIO_FILES_ROOT_DIRECTORY}/${scene.legalName}`;
      return {
        name: scene.legalName,
        fullPath,
        files: ["audio.wav", "data.json"].map((name) => ({
          name,
          fullPath: `${fullPath}/${name}`,
        })),
      };
    });
  } catch (e: any) {
    throw new KweenBException(
      { where: "getAudioFiles()", message: e.message },
      false
    );
  }
};

/**
 * Get the audio scenes
 */
export const getAudioScenes = async () => {
  try {
    return await BeeHelpers.getAudioScenes();
  } catch (e: any) {
    throw new KweenBException(
      { where: "getAudioScenes()", message: e.message },
      true
    );
  }
};

/**
 * Stop the audio chain (Jack, Jacktrip and Pure Data) on the client
 * @param event
 * @param bee
 */
export const killJackAndJacktrip = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await SpeakerApi.stopStream(bee.ipAddress);
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJackAndJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Manage the bee device
 * @param event
 * @param bees
 * @param action
 */
export const manageBeeDevice = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee[] | IBee,
  action: BeeDeviceManagerActions
) => {
  try {
    await BeeHelpers.manageBeeDevice(bees, action);
  } catch (e: any) {
    throw new KweenBException(
      { where: "manageBeeDevice()", message: e.message },
      true
    );
  }
};

/**
 * Pause or resume the update of audio scenes
 * @param event The invoke event
 * @param pause Whether to pause or resume
 */
export const pauseUpdateAudioScenes = async (
  event: Electron.IpcMainInvokeEvent,
  pause: boolean
) => {
  try {
    // only pause when the paused state is different than the current state
    if (KweenBGlobal.kweenb.beeStatesWorker.pauseUpdateAudioScenes !== pause) {
      KweenBGlobal.kweenb.beeStatesWorker.pauseUpdateAudioScenes = pause;
    }
  } catch (e: any) {
    throw new KweenBException(
      { where: "pauseUpdateAudioScenes()", message: e.message },
      false
    );
  }
};

/**
 * Set the audio param on the bee
 * @param event The invoke event
 * @param bees The bee or bees
 * @param pdAudioParam The audio param
 * @param value The value to set
 */
export const setAudioParam = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee[] | IBee,
  pdAudioParam: PDAudioParam,
  value: number | boolean
) => {
  try {
    await BeeHelpers.setAudioParam(bees, pdAudioParam, value);
  } catch (e: any) {
    throw new KweenBException(
      { where: "setAudioParams()", message: e.message },
      false
    );
  }
};

/**
 * Set the audio param for all bees
 * @param event The invoke event
 * @param pdAudioParam The audio param
 * @param value The value to set
 */
export const setAudioParamForAllBees = async (
  event: Electron.IpcMainInvokeEvent,
  pdAudioParam: PDAudioParam,
  value: number | boolean
) => {
  try {
    const bees = await fetchAllBees();
    bees.forEach(async (bee) => {
      if (bee.isOnline)
        await BeeHelpers.setAudioParam(bee, pdAudioParam, value);
    });
  } catch (e: any) {
    throw new KweenBException(
      { where: "setAudioParamForAllBees()", message: e.message },
      true
    );
  }
};

/**
 * Sets the bee active
 * @param event The invoke event
 * @param id The ID of the bee
 * @param active The active state of the bee
 * @returns
 */
export const setBeeActive = async (
  event: Electron.IpcMainInvokeEvent,
  id: number,
  active: boolean
) => {
  try {
    await BeeHelpers.setBeeActive(id, active);
  } catch (e: any) {
    throw new KweenBException(
      { where: "setBeeActive()", message: e.message },
      true
    );
  }
};

/**
 * Sets a Pozyx tag on a bee
 * @param event The invoke event
 * @param bee The bee
 * @param pozyxTagId The Pozyx tag ID
 * @returns
 */
export const setBeePozyxTagId = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee,
  pozyxTagId: string
) => {
  try {
    await BeeHelpers.setBeePozyxTagId(bee, pozyxTagId);
  } catch (e: any) {
    throw new KweenBException(
      { where: "setBeePozyxTagId()", message: e.message },
      true
    );
  }
};

/**
 * Start audio on the bee
 * @param event The invoke event
 * @param bees The bee or bees
 * @param value The value to set
 */
export const startAudio = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee[] | IBee,
  value: string
) => {
  try {
    await BeeHelpers.startAudio(bees, value);
  } catch (e: any) {
    throw new KweenBException(
      { where: "startAudio()", message: e.message },
      false
    );
  }
};

/**
 * Start the audio chain on a bee and connect to the hub server on kweenb
 * @param event
 * @param bee
 */
export const startJackWithJacktripHubClient = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await SpeakerApi.startStream(
      bee.ipAddress,
      await zwerm3ApiHelpers.createHubStreamRequest()
    );
  } catch (e: any) {
    throw new KweenBException(
      {
        where: "startJackWithJacktripHubClient()",
        message: `${bee.name}: ${e.message}`,
      },
      true
    );
  }
};

/**
 * Start the audio chain on a bee and wait for the P2P connection of kweenb
 * @param event
 * @param bee
 */
export const startJackWithJacktripP2PServer = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await SpeakerApi.startStream(
      bee.ipAddress,
      await zwerm3ApiHelpers.createP2PStreamRequest()
    );
  } catch (e: any) {
    throw new KweenBException(
      {
        where: "startJackWithJacktripP2PServer()",
        message: `${bee.name}: ${e.message}`,
      },
      true
    );
  }
};

/**
 * Stop audio on the bee
 * @param event The invoke event
 * @param bees The bee or bees
 * @param value The value to set
 */
export const stopAudio = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee[] | IBee,
  value: string
) => {
  try {
    await BeeHelpers.stopAudio(bees);
  } catch (e: any) {
    throw new KweenBException(
      { where: "startAudio()", message: e.message },
      false
    );
  }
};

/**
 * Update a Bee
 * @param event
 * @param bee
 */
export const updateBee = async (
  event: Electron.IpcMainInvokeEvent,
  bee: Partial<IBee>
) => {
  try {
    if (!bee.id) throw new Error("Please provide an id for the requested Bee.");
    Bee.update(bee, { where: { id: bee.id } });

    // the worker follows the bee on its (new) address
    const { id, name, ipAddress } = bee;
    KweenBGlobal.kweenb.beeStates.updateBeeData({
      id,
      ...(name !== undefined && { name }),
      ...(ipAddress !== undefined && { ipAddress }),
    });
  } catch (e: any) {
    throw new KweenBException(
      { where: "updateBee()", message: e.message },
      true
    );
  }
};

/**
 * Upload audio files to the bees
 */
export const uploadAudioFiles = async (
  event: Electron.IpcMainInvokeEvent,
  name: string,
  path: string
): Promise<AudioUploadStatusInfo> => {
  // reset the cancelled state
  KweenBGlobal.kweenb.currentUploadOperation = { cancelled: false };

  try {
    // during the upload process, pause the background worker that is constantly
    // synchronizing the data in the database with the state of the bees
    // The total upload process takes longer than the interval of the background worker
    // So, when we are uploading and upserting the database, the background worker
    // is in fact conflicting the database right away. Therefore, pause his behavour
    // once the upload is done, the background worker can start the sync work again
    // (see the finally statement in this function)
    KweenBGlobal.kweenb.beeStatesWorker.uploadingAudio = true;

    // create legal name for directory
    const legalName = Utils.convertToLegalDirectoryName(name);

    // the path under which the database knows the scene
    const remoteDirectory = `${AUDIO_FILES_ROOT_DIRECTORY}/${legalName}`;

    // get all current bees
    const bees = await fetchAllBees();

    // the bees that have (almost) no space left, as they reported it
    // themselves (online bees only)
    const beesWithoutSpaceLeft = bees.filter((bee) => {
      if (!bee.isOnline) return false;
      const storage = KweenBGlobal.kweenb.beeStates.getMonitoring(
        bee.id
      )?.storage;
      return storage
        ? storage.freeMb <= DISK_REMAINING_ON_BEE_TRESHOLD_MB
        : false;
    });

    if (beesWithoutSpaceLeft.length > 0) {
      // get all the bees that have no space left
      const beesWithoutSpaceLeftList = beesWithoutSpaceLeft
        .map((b) => b.name)
        .join(", ");

      // let the renderer know that there is no space left
      return {
        status: AudioUploadStatus.NO_DISK_SPACE,
        message: `The following bees have no space left: ${beesWithoutSpaceLeftList}. Please free up some space on the bees before uploading audio files.`,
      };
    }

    // Whenever we start uploading, remove all the file that are known based on the path
    // Why? Because if we upload KWEENB_TEST_ONE ONE and KWEENB_TEST_ONE-ONE, the (safe) path
    // is the same, but the naming is different... We want to avoid that there are duplicates
    // that were not removed
    await AudioScene.update(
      { markedForDeletion: true },
      {
        where: {
          localFolderPath: remoteDirectory,
        },
      }
    );

    // get all the wav files
    const files = await fs.readdirSync(path);
    // a recorder or another computer may write the extension in capitals
    const wavFiles = files.filter((file) => /^\d+\.wav$/i.test(file));

    // filter out the wavfiles
    const filteredWavFiles = wavFiles
      .filter((wavFile) =>
        bees.find((bee) => bee.isOnline && wavFile.startsWith(`${bee.id}.`))
      )
      .sort((a, b) => parseInt(a) - parseInt(b));

    // loop over filteredWavFiles and upload each file to its bee
    for (const wavFile of filteredWavFiles) {
      if (KweenBGlobal.kweenb.currentUploadOperation.cancelled) {
        return {
          status: AudioUploadStatus.CANCELLED,
          message: `Audio upload was cancelled.`,
        };
      }

      const beeId = parseInt(wavFile.split(".")[0]);
      const bee = bees.find((bee) => bee.id === beeId);

      // check if the bee is online
      if (bee && bee.isOnline) {
        // create the full path
        const fullPath = `${path}/${wavFile}`;

        // set the current upload operation
        KweenBGlobal.kweenb.currentUploadOperation.beeId = bee.id;

        let toldPercentage = -1;
        try {
          // upload the file to the bee: the bee stores it as the audio of
          // the scene together with its name, and only when it arrived complete
          await SpeakerApi.uploadScene(
            bee.ipAddress,
            legalName,
            name,
            fullPath,
            {
              onAbortable: (abort) => {
                if (KweenBGlobal.kweenb.currentUploadOperation)
                  KweenBGlobal.kweenb.currentUploadOperation.abort = abort;
              },
              onProgress: (percentage) => {
                // let the renderer know that we have upload data, once per
                // percent (the file is sent in thousands of small pieces)
                const whole = Math.floor(percentage);
                if (whole === toldPercentage) return;
                toldPercentage = whole;
                KweenBGlobal.kweenb.mainWindow.webContents.send(
                  "upload-audio-progress",
                  bee,
                  percentage
                );
              },
            }
          );
        } catch (e: any) {
          // a cancelled upload is not an error
          if (KweenBGlobal.kweenb.currentUploadOperation?.cancelled) {
            return {
              status: AudioUploadStatus.CANCELLED,
              message: `Audio upload was cancelled.`,
            };
          }
          throw new Error(`${bee.name}: ${e.message}`);
        } finally {
          if (KweenBGlobal.kweenb.currentUploadOperation)
            KweenBGlobal.kweenb.currentUploadOperation.abort = undefined;
        }

        // Check for cancellation before database update
        if (KweenBGlobal.kweenb.currentUploadOperation.cancelled) {
          return {
            status: AudioUploadStatus.CANCELLED,
            message: `Audio upload was cancelled.`,
          };
        }

        // add the audio scene to the database
        await AudioScene.upsert({
          name,
          oscAddress: `${legalName}/audio.wav`,
          localFolderPath: remoteDirectory,
          beeId: bee.id,
          manuallyAdded: true,
        });
      }
    }

    // show confirmation when audio files were uploaded
    return {
      status: AudioUploadStatus.SUCCESS,
      message: `Audio files were uploaded successfully.`,
    };
  } catch (e: any) {
    throw new KweenBException(
      { where: "uploadAudioFiles()", message: e.message },
      true
    );
  } finally {
    // the worker goes on, when the Audio page is still open
    KweenBGlobal.kweenb.beeStatesWorker.uploadingAudio = false;
  }
};
