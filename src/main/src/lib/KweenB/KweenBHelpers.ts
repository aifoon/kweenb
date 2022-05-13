/**
 * A module with helpers for the KweenB logic
 */

import {
  killAllProcesses,
  startJackDmpAsync,
  startJacktripClientAsync,
  isJacktripRunning,
} from "@zwerm3/jack";
import * as log from "electron-log";
import SettingHelpers from "./SettingHelpers";

/**
 * Kill all Jack and Jacktrip processes
 */
const killJackAndJacktrip = async () => {
  await killAllProcesses();
};

/**
 * Start Jack With Jacktrip clients
 */
const startJackWithJacktripClient = async () => {
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
    hub: true,
    queueBuffer: settings.kweenBAudioSettings.jacktrip.queueBufferLength,
    channels: settings.kweenBAudioSettings.jacktrip.channels,
    debug: false,
    realtimePriority: settings.kweenBAudioSettings.jacktrip.realtimePriority,
    bitRate: settings.kweenBAudioSettings.jacktrip.bitRate,
    clientName: "kweenb",
    host: settings.theKweenSettings.ipAddress,
    receiveChannels: settings.kweenBAudioSettings.jacktrip.receiveChannels,
    sendChannels: settings.kweenBAudioSettings.jacktrip.sendChannels,
    redundancy: settings.kweenBAudioSettings.jacktrip.redundancy,
  };

  /**
   * Start Jack
   */

  await startJackDmpAsync(jack, {
    onLog: async (message) => {
      console.log(message);
      log.info(message);
    },
  });

  /**
   * Start Jacktrip
   */

  await startJacktripClientAsync(jacktrip, {
    onLog: async (message) => {
      console.log(message);
      log.info(message);
    },
    softwareVersion: "1.5.3",
  });
};

export default {
  killJackAndJacktrip,
  startJackWithJacktripClient,
};
