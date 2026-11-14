/**
 * A module with helpers for the KweenB logic
 */

import {
  killAllProcesses,
  startJackDmpAsync,
  startJacktripHubServerAsync,
  startJacktripP2PClientAsync,
  connectChannel,
  disconnectChannel,
  Zwerm3Jack,
} from "@zwerm3/jack";
import { AppMode, BeeActiveState } from "@shared/enums";
import { IBee, IHubServerInfo } from "@shared/interfaces";
import fs from "fs";
import {
  DEBUG_JACK_JACKTRIP,
  START_PORT_JACKTRIP_HUB_SERVER,
  USER_DATA,
} from "../../consts";
import SettingHelpers from "./SettingHelpers";
import BeeHelpers from "./BeeHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import SpeakerApi from "./SpeakerApi";
import { PozyxMqttBroker } from "../Positioning/PozyxMqttBroker";
import { KweenBGlobal } from "../../kweenb";
import { join } from "path";
import { killExpress } from "../../express";
import { BitRate, HubPatchMode } from "@zwerm3/jack/dist/enums";
import { SocketSingleton } from "../socket/SocketSingleton";
import {
  JacktripHubServerParams,
  RunningCommand,
} from "@zwerm3/jack/dist/interfaces";

/**
 * This will kill all processes (on bees/kweenb/hive)
 */
const closeApplication = async (appMode: AppMode) => {
  // Kill the express server
  killExpress();

  // the active bees that are online right now
  const bees = (await BeeHelpers.getAllBees(BeeActiveState.ACTIVE)).filter(
    (bee) => bee.isOnline
  );

  // kill the workers
  KweenBGlobal.kweenb.beeStatesWorker.stopWorkers();

  // close all the bees (a bee that fails to stop does not keep kweenb open)
  await Zwerm3ApiHelpers.onBees(bees, (bee) =>
    SpeakerApi.stopStream(bee.ipAddress)
  );

  // close mqtt broker
  PozyxMqttBroker.disconnectPozyxMqttBroker();

  // close the internal socket server
  SocketSingleton.getInstance().socketServer.close();

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
    join(jacktripFolder, "jacktrip")
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
 * Start Jack
 */
const startJack = async () => {
  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  const jack = {
    device: settings.kweenBAudioSettings.jack.device,
    inputChannels: settings.kweenBAudioSettings.jack.inputChannels,
    outputChannels: settings.kweenBAudioSettings.jack.outputChannels,
    bufferSize: settings.kweenBAudioSettings.jack.bufferSize,
    sampleRate: settings.kweenBAudioSettings.jack.sampleRate,
    periods: settings.kweenBAudioSettings.jack.periods,
  };

  await startJackDmpAsync(jack, {
    onLog: async (message) => {
      if (DEBUG_JACK_JACKTRIP) console.log(message);
    },
  });
};

/**
 * Start Jacktrip Hub Server
 * @param groupedBees The amount of numbers in the array define the amount of servers, the number itself defines the max amount of bees per server
 */
const startJacktripHubServer = async (): Promise<IHubServerInfo> => {
  /**
   * Get and set the settings
   */

  const settings = await SettingHelpers.getAllSettings();

  /**
   * Create the Jacktrip Server Params
   */

  const jacktrip = {
    channels: settings.kweenBAudioSettings.jacktrip.channels,
    debug: false,
    localPort: START_PORT_JACKTRIP_HUB_SERVER,
    queueBuffer: settings.kweenBAudioSettings.jacktrip.queueBufferLength,
    bufferStrategy: settings.kweenBAudioSettings.jacktrip.bufferStrategy,
    realtimePriority: settings.kweenBAudioSettings.jacktrip.realtimePriority,
    connectDefaultAudioPorts: false,
    hubPatchMode: HubPatchMode.NoConnections,
    bitRate: settings.kweenBAudioSettings.jacktrip.bitRate,
    redundancy: settings.kweenBAudioSettings.jacktrip.redundancy,
  };

  /**
   * Start Jacktrip
   */

  const runningCommand = await startJacktripHubServerAsync(jacktrip, {
    onLog: async (message) => {
      if (DEBUG_JACK_JACKTRIP) console.log(message);
    },
  });

  /**
   * Add the output to the array
   */

  return {
    jacktripHubServerParams: jacktrip,
    runningCommand,
  };
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
    bufferStrategy: settings.kweenBAudioSettings.jacktrip.bufferStrategy,
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
 * The name a bee has in Jack on kweenb: the name the bee itself reports,
 * the name in the database as long as the bee did not report one
 * @param bee IBee
 */
const getJackClientName = (bee: IBee): string =>
  KweenBGlobal.kweenb.beeStates.getMonitoring(bee.id)?.identityName || bee.name;

/**
 * Disconnect all P2P audio connections
 */
const disconnectAllP2PAudioConnections = async () => {
  const activeBees = await BeeHelpers.getAllBeesData();
  activeBees.forEach(async (bee) => {
    const captureChannel = `system:capture_${bee.id}`;
    const sendChannel = `${getJackClientName(bee)}:send_1`;
    await disconnectChannel({
      source: captureChannel,
      destination: sendChannel,
    });
  });
};

/**
 * Make all the audio hub connections on kweenb.
 * The hub server shows every connected bee as a Jack client with the name the
 * bee reports, so each capture channel is connected straight to its bee.
 * @param bees The bees to connect, all bees if left out
 */
const makeHubAudioConnections = async (bees: IBee[] | null = null) => {
  const currentBees = bees || (await BeeHelpers.getAllBeesData());

  await Promise.all(
    currentBees.map((bee) =>
      connectChannel({
        source: `system:capture_${bee.id}`,
        destination: `${getJackClientName(bee)}:send_1`,
      })
    )
  );
};

/**
 * Make a P2P audio connection from a system device to bee
 * @param bee IBee
 */
const makeP2PAudioConnection = async (bee: IBee) => {
  const captureChannel = `system:capture_${bee.id}`;
  const sendChannel = `${getJackClientName(bee)}:send_1`;
  await connectChannel({
    source: captureChannel,
    destination: sendChannel,
  });
};

/**
 * Make all the P2P audio connection on kweenb
 * @param bees The bees to connect, all active bees if left out
 */
const makeP2PAudioConnections = async (bees: IBee[] | null = null) => {
  const activeBees = bees || (await BeeHelpers.getAllBeesData());
  await Promise.all(activeBees.map((bee) => makeP2PAudioConnection(bee)));
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
  getJackClientName,
  isJackAndJacktripInstalled,
  killJackAndJacktrip,
  makeHubAudioConnections,
  makeP2PAudioConnection,
  makeP2PAudioConnections,
  startJack,
  startJacktripHubServer,
  startJackWithJacktripP2PClient,
  setJackFolderPath,
  setJacktripBinPath,
};
