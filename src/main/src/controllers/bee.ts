/**
 * A module with all the kweenb data stuff
 */

import fs from "fs";
import {
  AudioFile,
  IBee,
  IBeeConfig,
  IBeeInput,
  IBeeState,
} from "@shared/interfaces";
import { Utils } from "@shared/utils";
import { BeeActiveState, PDAudioParam } from "@shared/enums";
import { KweenBGlobal } from "../kweenb";
import zwerm3ApiHelpers from "../lib/KweenB/Zwerm3ApiHelpers";
import BeeSsh from "../lib/KweenB/BeeSsh";
import Bee from "../models/Bee";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import { SSH_PRIVATE_KEY_PATH, audioFilesRootDirectory } from "../consts";
import Ssh2SftpClient from "ssh2-sftp-client";

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
  path: string
) => {
  try {
    // set the guard to prevent deleting files outside the audio files root directory
    if (path.startsWith(audioFilesRootDirectory)) {
      await BeeSsh.deletePath(bee.ipAddress, path);
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
      true
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
 * Hook this bee on the hive (if hive exists)
 * @param event
 * @param bee
 */
export const hookOnCurrentHive = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeHelpers.hookOnCurrentHive(bee.id);
  } catch (e: any) {
    throw new KweenBException(
      { where: "hookOnCurrentHive()", message: e.message },
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
 * Make an audio connection on the bee
 * @param event
 * @param bee
 */
export const makeP2PAudioConnection = async (
  event: Electron.IpcMainInvokeEvent,
  bee: IBee
) => {
  try {
    await BeeHelpers.makeP2PAudioConnection(bee);
  } catch (e: any) {
    throw new KweenBException(
      { where: "makeP2PAudioConnection()", message: e.message },
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
  bee: IBee
) => {
  try {
    await zwerm3ApiHelpers.startJack(bee.ipAddress);
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
) => {
  try {
    // create legal name for directory
    const legalName = Utils.convertToLegalDirectoryName(name);

    // get all current bees
    const bees = await fetchAllBees();

    // get all the wav files
    const files = await fs.readdirSync(path);
    const wavFiles = files.filter((file) => /^\d+\.wav$/.test(file));

    // filter out the wavfiles
    const filteredWavFiles = wavFiles.filter((wavFile) =>
      bees.find((bee) => bee.isOnline && wavFile.startsWith(`${bee.id}.`))
    );

    // loop over filteredWavFiles and create the directory with legel name on the bee
    for (const wavFile of filteredWavFiles) {
      const beeId = parseInt(wavFile.split(".")[0]);
      const bee = bees.find((bee) => bee.id === beeId);

      // check if the bee is online
      if (bee && bee.isOnline) {
        // create the full path
        const fullPath = `${path}/${wavFile}`;

        // the remote directory and path
        const remoteDirectory = `${audioFilesRootDirectory}/${legalName}`;

        // the remote path of the audio file
        const remotePath = `${audioFilesRootDirectory}/${legalName}/audio.wav`;

        // upload the file to the bee
        const sftp = new Ssh2SftpClient();
        try {
          await sftp.connect({
            host: bee.ipAddress,
            username: "pi",
            privateKey: fs.readFileSync(SSH_PRIVATE_KEY_PATH),
          });
          await sftp.mkdir(remoteDirectory);
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
          await BeeSsh.writeDataToFile(
            bee.ipAddress,
            `${remoteDirectory}/data.json`,
            JSON.stringify({ name, oscAddress: `${legalName}/audio.wav` })
          );
          sftp.end();
        } catch (e: any) {
          throw new Error(e.message);
        }
      }
    }
  } catch (e: any) {
    throw new KweenBException(
      { where: "uploadAudioFiles()", message: e.message },
      true
    );
  }
};
