/**
 * A module with helpers for the KweenB logic
 */

import {
  killAllProcesses,
  startJackDmpAsync,
  startJacktripHubServerAsync,
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
import {
  DEBUG_JACK_JACKTRIP,
  JACKTRIP_HUB_PORT,
  USER_DATA,
} from "../../consts";
import SettingHelpers from "./SettingHelpers";
import BeeHelpers from "./BeeHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import { PozyxMqttBroker } from "../Positioning/PozyxMqttBroker";
import { KweenBGlobal } from "../../kweenb";
import { join } from "path";
import { killExpress } from "../../express";
import { HubPatchMode } from "@zwerm3/jack/dist/enums";

/**
 * This will kill all processes (on bees/kweenb/hive)
 */
const closeApplication = async (appMode: AppMode) => {
  // Kill the express server
  killExpress();

  // kill the workers
  KweenBGlobal.kweenb.beeStatesWorker.stopWorkers();

  // close all the bees
  const bees = await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
  const beeKillPromises = bees.map(async (bee) => {
    if (bee.isOnline) Zwerm3ApiHelpers.killJackAndJacktrip(bee.ipAddress);
  });
  await Promise.all(beeKillPromises);

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
  const jacktripFolder = `${USER_DATA}/jacktrip`;
  const jackFolder = `${USER_DATA}/jack`;

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
 * Start Jacktrip Hub Server
 */
const startJacktripHubServer = async () => {
  /**
   * Get and set the settings
   */

  const settings = await SettingHelpers.getAllSettings();

  const jacktrip = {
    channels: settings.kweenBAudioSettings.jacktrip.channels,
    debug: false,
    localPort: JACKTRIP_HUB_PORT,
    queueBuffer: settings.kweenBAudioSettings.jacktrip.queueBufferLength,
    realtimePriority: settings.kweenBAudioSettings.jacktrip.realtimePriority,
    connectDefaultAudioPorts: false,
    HubPatchMode: HubPatchMode.NoConnections,
  };

  /**
   * Start Jacktrip
   */

  await startJacktripHubServerAsync(jacktrip, {
    onLog: async (message) => {
      if (DEBUG_JACK_JACKTRIP) console.log(message);
    },
  });
};

/**
 * Start Jack With Jacktrip Hub client
 */
const startJackWithJacktripHubClient = async () => {
  /**
   * Get and set the settings
   */

  const settings = await SettingHelpers.getAllSettings();
  const currentActiveBees = await BeeHelpers.getAllBees(BeeActiveState.ACTIVE);

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
    host: "localhost",
    receiveChannels: settings.kweenBAudioSettings.jacktrip.receiveChannels,
    // if in the settings the sendChannels is higher than the active bees, use the active bees
    // it's not necessary to have more send channels than active bees
    sendChannels:
      settings.kweenBAudioSettings.jacktrip.sendChannels >
      currentActiveBees.length
        ? currentActiveBees.length
        : settings.kweenBAudioSettings.jacktrip.sendChannels,
    redundancy: settings.kweenBAudioSettings.jacktrip.redundancy,
    remotePort: JACKTRIP_HUB_PORT,
    connectDefaultAudioPorts: false,
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

  await startJacktripHubClientAsync(jacktrip, {
    onLog: async (message) => {
      if (DEBUG_JACK_JACKTRIP) console.log(message);
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
  const activeBees = await BeeHelpers.getAllBeesData();
  activeBees.forEach(async (bee) => {
    await makeP2PAudioConnection(bee);
  });
};

/**
 * Make all the audio hub connections on kweenb and the hub
 * @param sendChannels
 */
const makeHubAudioConnections = async () => {
  const activeBees = await BeeHelpers.getAllBeesData();

  // Connect the active bees in the hub
  activeBees.forEach(async (bee, index) => {
    // Connect the capture channel to the open send channels on kweenb
    const captureChannelToBee = `system:capture_${bee.id}`;
    const sendChannelToKweenBRemote = `kweenb:send_${index + 1}`;
    await connectChannel({
      source: captureChannelToBee,
      destination: sendChannelToKweenBRemote,
    });

    // Connect the receive channel from kweenb-remote to the bee
    const receiveChannelFromKweenBRemote = `kweenb-remote:receive_${index + 1}`;
    const sendChannelOfBee = `${bee.name}:send_1`;
    await connectChannel({
      source: receiveChannelFromKweenBRemote,
      destination: sendChannelOfBee,
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
  makeHubAudioConnections,
  makeP2PAudioConnection,
  makeP2PAudioConnections,
  startJacktripHubServer,
  startJackWithJacktripHubClient,
  startJackWithJacktripP2PClient,
  setJackFolderPath,
  setJacktripBinPath,
};
