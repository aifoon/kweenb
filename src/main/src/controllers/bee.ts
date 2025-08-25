/**
 * A module with all the kweenb data stuff
 */

import fs from "fs";
import {
  AudioFile,
  AudioUploadStatusInfo,
  IBee,
  IBeeConfig,
  IBeeInput,
  IBeeState,
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
import BeeSsh from "../lib/KweenB/BeeSsh";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import { SSH_PRIVATE_KEY_PATH, AUDIO_FILES_ROOT_DIRECTORY } from "../consts";
import Ssh2SftpClient from "ssh2-sftp-client";
import BeeSshScriptExecutor from "../lib/KweenB/BeeSshScriptExecutor";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import AudioSceneDb from "../models/AudioScene";

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
    // Close any active SFTP connections
    if (KweenBGlobal.kweenb.currentUploadOperation.sftp) {
      try {
        KweenBGlobal.kweenb.currentUploadOperation.sftp.end();
      } catch (e) {
        // Ignore errors when closing
      }
    }
    KweenBGlobal.kweenb.currentUploadOperation.cancelled = true;
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

    // if we need to delete on all bees, delete the file on all bees
    if (deleteOnAllBees) {
      const onlineBees = (
        await BeeHelpers.getAllBees(BeeActiveState.ALL)
      ).filter((bee) => bee.isOnline);

      // remove the folders on all bees
      await new BeeSshScriptExecutor().executeWithNoOutput(
        "remove_folders_on_bees.sh",
        onlineBees,
        [{ flag: "-d", value: path }]
      );

      // remove the folders in the database
      await Promise.all(
        onlineBees.map(async (bee) => {
          await AudioScene.update(
            { markedForDeletion: true },
            { where: { localFolderPath: path, beeId: bee.id } }
          );
        })
      );
    } else {
      await BeeSsh.deletePath(bee.ipAddress, path);
      await AudioScene.update(
        { markedForDeletion: true },
        { where: { localFolderPath: path, beeId: bee.id } }
      );
    }
  } catch (e: any) {
    throw new KweenBException(
      { where: "deleteFile()", message: e.message },
      true
    );
  }
};

/**
 * Fetch the active bees
 * @param event
 * @returns
 */
export const fetchActiveBees = async () => {
  try {
    return await BeeHelpers.getAllBees(BeeActiveState.ACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchActiveBees()",
      message: e.message,
    });
  }
};

/**
 * Fetch the active bees without status checks
 * @param event
 * @returns
 */
export const fetchActiveBeesData = async () => {
  try {
    return await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchActiveBeesData()",
      message: e.message,
    });
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
 * Fetch all the bees without extra status checks
 */
export const fetchAllBeesData = async (): Promise<IBee[]> => {
  try {
    return await BeeHelpers.getAllBeesData(BeeActiveState.ALL);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchAllBeesData()",
      message: e.message,
    });
  }
};

/**
 * Fetch the inactive bees
 * @param event
 * @returns
 */
export const fetchInActiveBees = async () => {
  try {
    return await BeeHelpers.getAllBees(BeeActiveState.INACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchInActiveBees()",
      message: e.message,
    });
  }
};

/**
 * Fetch the inactive bees without extra status checks
 * @param event
 * @returns
 */
export const fetchInActiveBeesData = async () => {
  try {
    return await BeeHelpers.getAllBeesData(BeeActiveState.INACTIVE);
  } catch (e: any) {
    throw new KweenBException({
      where: "fetchInActiveBeesData()",
      message: e.message,
    });
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
 * Flush all audio scenes from the database
 * @param event
 */
export const flushAudioScenes = async (event: Electron.IpcMainInvokeEvent) => {
  try {
    await AudioSceneDb.destroy({ where: {} });
  } catch (e: any) {
    throw new KweenBException(
      { where: "flushAudioScenes()", message: e.message },
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
    return await BeeSsh.getAudioFiles(bee.ipAddress);
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
 * Get the bee config
 * @param event
 * @param id The ID of the bee
 * @returns
 */
export const getBeeConfig = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee | number
): Promise<IBeeConfig> => {
  try {
    if (typeof bee === "number") {
      return await BeeHelpers.getBeeConfig(bee);
    } else {
      return await BeeHelpers.getBeeConfig(bee.id);
    }
  } catch (e: any) {
    throw new KweenBException(
      { where: "getBeeConfig()", message: e.message },
      true
    );
  }
};

/**
 * Get the current bee states
 * @param event
 * @param bees The list of bees
 * @returns
 */
export const getCurrentBeeStates = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee[]
): Promise<IBeeState[]> => {
  try {
    return await BeeHelpers.getCurrentBeeStates(bees);
  } catch (e: any) {
    throw new KweenBException(
      { where: "getCurrentBeeStates()", message: e.message },
      true
    );
  }
};

/**
 * Kill Jack And Jacktrip processes on the client
 * @param event
 * @param bee
 */
export const killJackAndJacktrip = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeSsh.killJackAndJacktrip(bee.ipAddress);
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJackAndJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Kill Jack processes on the client
 * @param event
 * @param bee
 */
export const killJack = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeSsh.killJack(bee.ipAddress);
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJack()", message: e.message },
      true
    );
  }
};

/**
 * Kill Jacktrip processes on the client
 * @param event
 * @param bee
 */
export const killJacktrip = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeSsh.killJacktrip(bee.ipAddress);
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Kill Pure Data processes on the client
 * @param event
 * @param bee
 */
export const killPureData = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeSsh.killPureData(bee.ipAddress);
  } catch (e: any) {
    throw new KweenBException(
      { where: "killPureData()", message: e.message },
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
 * Make an audio connection on the bee
 * @param event
 * @param bee
 */
export const makeAudioConnection = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee[] | IBee
) => {
  try {
    await BeeHelpers.makeAudioConnection(bees);
  } catch (e: any) {
    throw new KweenBException(
      { where: "makeAudioConnection()", message: e.message },
      true
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
 * Start Jack on a specific bee
 * @param event The Invoke event
 * @param bee
 */
export const startJack = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee,
  triggerOnly: boolean = false
) => {
  try {
    await zwerm3ApiHelpers.startJack(bee.ipAddress, triggerOnly);
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJack()", message: e.message },
      true
    );
  }
};

/**
 * Start Pure Data on a specific bee
 * @param event The Invoke event
 * @param bee
 */
export const startPureData = async (
  event: Electron.IpcMainInvokeEvent,
  bees: IBee | IBee[]
) => {
  try {
    if (!Array.isArray(bees)) bees = [bees];
    for (const bee of bees) {
      await BeeSsh.startPureData(bee.ipAddress);
    }
  } catch (e: any) {
    throw new KweenBException(
      { where: "startPureData()", message: e.message },
      true
    );
  }
};

/**
 * Start Jack and connect to the kween
 * @param event
 * @param bee
 */
export const startJackWithJacktripHubClient = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.startJackWithJacktripHubClient(
      bee.ipAddress,
      bee.name
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJackWithJacktripHubClient()", message: e.message },
      true
    );
  }
};

/**
 * Start the P2P server on a bee
 * @param event
 * @param bee
 */
export const startJackWithJacktripP2PServer = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.startJackWithJacktripP2PServer(
      bee.ipAddress,
      bee.name
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJackWithJacktripP2PServer()", message: e.message },
      true
    );
  }
};

/**
 * Start the Jacktrip P2P server on a bee
 * @param event
 * @param bee
 */
export const startJacktripP2PServer = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.startJacktripP2PServer(bee.ipAddress, bee.name);
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJacktripP2PServer()", message: e.message },
      true
    );
  }
};

/**
 * Saves in the internal configuration
 * @param event
 * @param bee
 */
export const saveConfig = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee,
  config: Partial<IBeeConfig>
) => {
  try {
    if (!bee.id) throw new Error("Please provide an id for the requested Bee.");
    await zwerm3ApiHelpers.saveConfig(bee.ipAddress, config);
  } catch (e: any) {
    throw new KweenBException(
      { where: "saveConfig()", message: e.message },
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
    KweenBGlobal.kweenb.beeStatesWorker.pauseUpdateAudioScenes = true;

    // create legal name for directory
    const legalName = Utils.convertToLegalDirectoryName(name);

    // the remote directory and path
    const remoteDirectory = `${AUDIO_FILES_ROOT_DIRECTORY}/${legalName}`;

    // get all current bees
    const bees = await fetchAllBees();

    // get the bees disk spaces (online bees only)
    const beesDiskSpaces = await BeeHelpers.getBeesDiskSpace(
      bees.filter((b) => b.isOnline)
    );

    // filter out the bees that have no space left
    const beesWithoutSpaceLeft = beesDiskSpaces.filter(
      (beeDiskSpace) => !beeDiskSpace.hasSpaceLeft
    );

    if (beesWithoutSpaceLeft.length > 0) {
      // get all the bees that have no space left
      const beesWithoutSpaceLeftList = beesWithoutSpaceLeft
        .map((beeDiskSpace) => {
          return bees.find((bee) => bee.ipAddress === beeDiskSpace.ipAddress);
        })
        .map((b) => b?.name)
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

    // get the location of the ssh private key
    const sshPrivateKey =
      (await SettingHelpers.getAllSettings()).kweenBSettings.sshKeyPath ||
      SSH_PRIVATE_KEY_PATH;

    // get all the wav files
    const files = await fs.readdirSync(path);
    const wavFiles = files.filter((file) => /^\d+\.wav$/.test(file));

    // filter out the wavfiles
    const filteredWavFiles = wavFiles
      .filter((wavFile) =>
        bees.find((bee) => bee.isOnline && wavFile.startsWith(`${bee.id}.`))
      )
      .sort((a, b) => parseInt(a) - parseInt(b));

    // loop over filteredWavFiles and create the directory with legal name on the bee
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

        // the remote path of the audio file
        const remotePath = `${AUDIO_FILES_ROOT_DIRECTORY}/${legalName}/audio.wav`;

        // upload the file to the bee
        const sftp = new Ssh2SftpClient();

        // set the current upload operation
        KweenBGlobal.kweenb.currentUploadOperation.sftp = sftp;
        KweenBGlobal.kweenb.currentUploadOperation.beeId = bee.id;

        try {
          await sftp.connect({
            host: bee.ipAddress,
            username: "pi",
            privateKey: fs.readFileSync(sshPrivateKey),
          });

          if (KweenBGlobal.kweenb.currentUploadOperation.cancelled) {
            return {
              status: AudioUploadStatus.CANCELLED,
              message: `Audio upload was cancelled.`,
            };
          }

          await sftp.mkdir(remoteDirectory);

          if (KweenBGlobal.kweenb.currentUploadOperation.cancelled) {
            return {
              status: AudioUploadStatus.CANCELLED,
              message: `Audio upload was cancelled.`,
            };
          }

          await sftp.fastPut(fullPath, remotePath, {
            step: function (total_transferred, chunk, total) {
              // calculate the percentage
              const percentage = (total_transferred / total) * 100;

              // let the renderer know that we have upload data
              KweenBGlobal.kweenb.mainWindow.webContents.send(
                "upload-audio-progress",
                bee,
                percentage
              );
            },
          });

          if (KweenBGlobal.kweenb.currentUploadOperation.cancelled) {
            return {
              status: AudioUploadStatus.CANCELLED,
              message: `Audio upload was cancelled.`,
            };
          }

          // write the data to the local data file
          await BeeSsh.writeDataToFile(
            bee.ipAddress,
            `${remoteDirectory}/data.json`,
            JSON.stringify({ name, oscAddress: `${legalName}/audio.wav` })
          );

          // close the connection
          sftp.end();

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
        } catch (e: any) {
          throw new Error(e.message);
        }
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
    KweenBGlobal.kweenb.beeStatesWorker.pauseUpdateAudioScenes = false;
  }
};
