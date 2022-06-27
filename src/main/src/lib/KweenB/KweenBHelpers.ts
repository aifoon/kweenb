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
} from "@zwerm3/jack";
// import * as log from "electron-log";
import { AppMode, BeeActiveState } from "@shared/enums";
import { IBee } from "@shared/interfaces";
import { DEBUG_JACK_JACKTRIP, DEBUG_KWEENB } from "../../consts";
import SettingHelpers from "./SettingHelpers";
import BeeHelpers from "./BeeHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import TheKweenHelpers from "./TheKweenHelpers";

/**
 * This will kill all processes (on bees/kweenb/hive)
 */
const closeApplication = async (appMode: AppMode) => {
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

  // close kweenb
  await killAllProcesses();
};

/**
 * Kill all Jack and Jacktrip processes
 */
const killJackAndJacktrip = async () => {
  await killAllProcesses();
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

export default {
  closeApplication,
  disconnectAllP2PAudioConnections,
  killJackAndJacktrip,
  makeP2PAudioConnection,
  makeP2PAudioConnections,
  startJackWithJacktripHubClient,
  startJackWithJacktripP2PClient,
};
