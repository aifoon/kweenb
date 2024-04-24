/**
 * A module with helpers for the KweenB logic
 */

import {
  killAllProcesses,
  startJackDmpAsync,
  startJacktripHubClientAsync,
  startJacktripP2PClientAsync,
  connectChannel,
  disconnectChannel,
  Zwerm3Jack,
} from "@zwerm3/jack";
// import * as log from "electron-log";
import { AppMode, BeeActiveState } from "@shared/enums";
import { IBee } from "@shared/interfaces";
import fs from "fs";
import { DEBUG_JACK_JACKTRIP, DEBUG_KWEENB } from "../../consts";
import SettingHelpers from "./SettingHelpers";
import BeeHelpers from "./BeeHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import TheKweenHelpers from "./TheKweenHelpers";
import { PozyxMqttBroker } from "../Positioning/PozyxMqttBroker";
import { KweenBGlobal } from "../../kweenb";
import { resourcesPath } from "@shared/resources";
import { join } from "path";

/**
 * This will kill all processes (on bees/kweenb/hive)
 */
const closeApplication = async (appMode: AppMode) => {
  // kill the workers
  KweenBGlobal.kweenb.beeStatesWorker.stopWorkers();

  // close all the bees
  const bees = await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
  const beeKillPromises = bees.map(async (bee) => {
    if (bee.isOnline) Zwerm3ApiHelpers.killJackAndJacktrip(bee.ipAddress);
  });
  await Promise.all(beeKillPromises);

  // close the hub/hive in hub mode
  if (appMode === AppMode.Hub) {
    const settings = await SettingHelpers.getAllSettings();
    const theKween = await TheKweenHelpers.getTheKween();
    if (theKween.isOnline)
      await Zwerm3ApiHelpers.killJackAndJacktrip(
        settings.theKweenSettings.ipAddress
      );
  }

  // close mqtt broker
  PozyxMqttBroker.disconnectPozyxMqttBroker();

  // close jack/jacktrip
  await killAllProcesses();
};

/**
 * Kill all Jack and Jacktrip processes
 */
const killJackAndJacktrip = async () => {
  await killAllProcesses();
};

/**
 * Check if Jack and Jacktrip is installed on the system
 */
const isJackAndJacktripInstalled = () => {
  // define the path to the jack and jacktrip folder
  const jacktripFolder = `${resourcesPath}/jacktrip`;
  const jackFolder = `${resourcesPath}/jack`;

  // jack
  const jackFolderExists = fs.existsSync(jackFolder);
  const jackBinExists = fs.existsSync(join(jackFolder, "jackd"));
  const QjackCtlExists = fs.existsSync(join(jackFolder, "QjackCtl.app"));

  // jacktrip
  const jacktripFolderExists = fs.existsSync(jacktripFolder);
  const jacktripBinExists = fs.existsSync(
    join(jacktripFolder, "JackTrip.app", "Contents", "MacOs", "jacktrip")
  );

  // do the validation
  return (
    jackFolderExists &&
    jackBinExists &&
    QjackCtlExists &&
    jacktripFolderExists &&
    jacktripBinExists
  );
};

/**
 * Start Jack With Jacktrip Hub client
 */
const startJackWithJacktripHubClient = async () => {
  /**
   * First kill all jack and jacktrip processes
   */

  await killAllProcesses();

  /**
   * Get and set the settings
   */

  const settings = await SettingHelpers.getAllSettings();

  const jack = {
    device: settings.kweenBAudioSettings.jack.device,
    inputChannels: settings.kweenBAudioSettings.jack.inputChannels,
    outputChannels: settings.kweenBAudioSettings.jack.outputChannels,
    bufferSize: settings.kweenBAudioSettings.jack.bufferSize,
    sampleRate: settings.kweenBAudioSettings.jack.sampleRate,
    periods: settings.kweenBAudioSettings.jack.periods,
  };

  const jacktrip = {
    channels: settings.kweenBAudioSettings.jacktrip.channels,
    debug: false,
    killAllJacktripBeforeStart: false,
    localPort: settings.kweenBAudioSettings.jacktrip.localPort,
    queueBuffer: settings.kweenBAudioSettings.jacktrip.queueBufferLength,
    realtimePriority: settings.kweenBAudioSettings.jacktrip.realtimePriority,
    bitRate: settings.kweenBAudioSettings.jacktrip.bitRate,
    clientName: "kweenb",
    host: settings.theKweenSettings.ipAddress,
    receiveChannels: settings.kweenBAudioSettings.jacktrip.receiveChannels,
    sendChannels: settings.kweenBAudioSettings.jacktrip.sendChannels,
    redundancy: settings.kweenBAudioSettings.jacktrip.redundancy,
    remotePort: 4464,
  };

  /**
   * Start Jack
   */

  await startJackDmpAsync(jack, {
    onLog: async (message) => {
      console.log(message);
    },
  });

  /**
   * Start Jacktrip
   */

  await startJacktripHubClientAsync(jacktrip, {
    onLog: async (message) => {
      console.log(message);
    },
  });
};

/**
 * Start Jack With Jacktrip P2P Client
 * @param ipAddress The ip address where the zwerm3api is running
 */
const startJackWithJacktripP2PClient = async (
  ipAddress: string,
  localPort: number,
  clientName: string
) => {
  /**
   * Get and set the settings
   */

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const jack = {
    device: settings.kweenBAudioSettings.jack.device,
    inputChannels: settings.kweenBAudioSettings.jack.inputChannels,
    outputChannels: settings.kweenBAudioSettings.jack.outputChannels,
    bufferSize: settings.kweenBAudioSettings.jack.bufferSize,
    sampleRate: settings.kweenBAudioSettings.jack.sampleRate,
    periods: settings.kweenBAudioSettings.jack.periods,
  };

  const jacktrip = {
    channels: settings.kweenBAudioSettings.jacktrip.channels,
    debug: false,
    killAllJacktripBeforeStart: false,
    localPort,
    queueBuffer: settings.kweenBAudioSettings.jacktrip.queueBufferLength,
    realtimePriority: settings.kweenBAudioSettings.jacktrip.realtimePriority,
    bitRate: settings.kweenBAudioSettings.jacktrip.bitRate,
    clientName,
    receiveChannels: 1,
    connectDefaultAudioPorts: false,
    redundancy: settings.kweenBAudioSettings.jacktrip.redundancy,
    sendChannels: 1,
    host: ipAddress,
    remotePort: settings.beeAudioSettings.jacktrip.localPort,
  };

  /**
   * Start Jack
   */

  await startJackDmpAsync(jack, {
    onLog: async (message) => {
      if (DEBUG_JACK_JACKTRIP) console.log(message);
    },
  });

  /**
   * Start Jacktrip
   */

  await startJacktripP2PClientAsync(jacktrip, {
    onLog: async (message) => {
      if (DEBUG_JACK_JACKTRIP) console.log(message);
    },
  });
};

/**
 * Disconnect all P2P audio connections
 */
const disconnectAllP2PAudioConnections = async () => {
  const activeBees = await BeeHelpers.getAllBeesData();
  activeBees.forEach(async (bee) => {
    const captureChannel = `system:capture_${bee.id}`;
    const sendChannel = `${bee.name}:send_1`;
    await disconnectChannel({
      source: captureChannel,
      destination: sendChannel,
    });
  });
};

/**
 * Make a P2P audio connection from a system device to bee
 * @param bee IBee
 */
const makeP2PAudioConnection = async (bee: IBee) => {
  const captureChannel = `system:capture_${bee.id}`;
  const sendChannel = `${bee.name}:send_1`;
  await connectChannel({
    source: captureChannel,
    destination: sendChannel,
  });
};

/**
 * Make all the P2P audio connection on kweenb
 */
const makeP2PAudioConnections = async () => {
  // get all active bees
  const activeBees = await BeeHelpers.getAllBeesData();
  activeBees.forEach(async (bee) => {
    const captureChannel = `system:capture_${bee.id}`;
    const sendChannel = `${bee.name}:send_1`;
    if (DEBUG_KWEENB)
      console.log(`** Connecting ${captureChannel} with ${sendChannel}`);
    await connectChannel({
      source: captureChannel,
      destination: sendChannel,
    });
  });
};

/**
 * Sets the folder path where the jack binaries can be found
 * @param jackFolderPath string
 */
const setJackFolderPath = (jackFolderPath: string) => {
  if (fs.existsSync(jackFolderPath)) {
    Zwerm3Jack.default.jackFolderPath = jackFolderPath;
  } else {
    throw new Error("The given Jack folder does not exist");
  }
};

/**
 * Sets the path to the jacktrip binary
 * @param jacktripBinPath string
 */
const setJacktripBinPath = (jacktripBinPath: string) => {
  if (fs.existsSync(jacktripBinPath)) {
    Zwerm3Jack.default.jacktripBinPath = jacktripBinPath;
  } else {
    throw new Error("The given Jacktrip binary does not exist");
  }
};

export default {
  closeApplication,
  disconnectAllP2PAudioConnections,
  isJackAndJacktripInstalled,
  killJackAndJacktrip,
  makeP2PAudioConnection,
  makeP2PAudioConnections,
  startJackWithJacktripHubClient,
  startJackWithJacktripP2PClient,
  setJackFolderPath,
  setJacktripBinPath,
};
