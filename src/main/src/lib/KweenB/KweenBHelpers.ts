/**
 * A module with helpers for the KweenB logic
 */

import {
  killAllProcesses,
  startJackDmpAsync,
  startJacktripHubServerAsync,
  startJacktripP2PClientAsync,
  connectChannel,
  killProcessByPid,
  Zwerm3Jack,
} from "@zwerm3/jack";
import { AppMode, BeeActiveState, ChannelType } from "@shared/enums";
import { IBee, IHubServerInfo } from "@shared/interfaces";
import fs from "fs";
import {
  START_PORT_JACKTRIP,
  START_PORT_JACKTRIP_HUB_SERVER,
  USER_DATA,
} from "../../consts";
import SettingHelpers from "./SettingHelpers";
import BeeHelpers from "./BeeHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";
import SpeakerApi from "./SpeakerApi";
import { INSTALLED_DRIVER, SOUND_DEVICE_UID } from "../SoundDevice/SoundDevice";
import { PozyxMqttBroker } from "../Positioning/PozyxMqttBroker";
import { KweenBGlobal } from "../../kweenb";
import { join } from "path";
import { killExpress } from "../../express";
import { HubPatchMode } from "@zwerm3/jack/dist/enums";
import { SocketSingleton } from "../socket/SocketSingleton";
import { RunningCommand } from "@zwerm3/jack/dist/interfaces";

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
  const jacktripBinExists = fs.existsSync(join(jacktripFolder, "jacktrip"));

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
 * The sound device Jack listens to: the one that was chosen, KweenB's own
 * device when nothing was chosen and it is installed, else the default
 * device of the computer
 */
const jackDeviceOf = (chosenDevice: string): string => {
  if (chosenDevice) return chosenDevice;
  return fs.existsSync(INSTALLED_DRIVER) ? SOUND_DEVICE_UID : "";
};

/**
 * Start Jack
 */
const startJack = async () => {
  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  const jack = {
    device: jackDeviceOf(settings.kweenBAudioSettings.jack.device),
    inputChannels: settings.kweenBAudioSettings.jack.inputChannels,
    outputChannels: settings.kweenBAudioSettings.jack.outputChannels,
    bufferSize: settings.kweenBAudioSettings.jack.bufferSize,
    sampleRate: settings.kweenBAudioSettings.jack.sampleRate,
    periods: settings.kweenBAudioSettings.jack.periods,
  };

  await startJackDmpAsync(jack, {});
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

  const runningCommand = await startJacktripHubServerAsync(jacktrip, {});

  /**
   * Add the output to the array
   */

  // remembered, so a single bee can connect to it again later
  hubServer = {
    jacktripHubServerParams: jacktrip,
    runningCommand,
  };
  return hubServer;
};

// the Jacktrip hub server on kweenb that was started last
let hubServer: IHubServerInfo | null = null;

/**
 * Start Jack With Jacktrip P2P Client
 * @param ipAddress The ip address where the zwerm3api is running
 */
const startJackWithJacktripP2PClient = async (
  ipAddress: string,
  localPort: number,
  clientName: string,
  // 1: a mono bee, 2: a stereo bee
  channels: number = 1
) => {
  /**
   * Get and set the settings
   */

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const jack = {
    device: jackDeviceOf(settings.kweenBAudioSettings.jack.device),
    inputChannels: settings.kweenBAudioSettings.jack.inputChannels,
    outputChannels: settings.kweenBAudioSettings.jack.outputChannels,
    bufferSize: settings.kweenBAudioSettings.jack.bufferSize,
    sampleRate: settings.kweenBAudioSettings.jack.sampleRate,
    periods: settings.kweenBAudioSettings.jack.periods,
  };

  const jacktrip = {
    channels,
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
    sendChannels: channels,
    host: ipAddress,
    remotePort: settings.beeAudioSettings.jacktrip.localPort,
  };

  /**
   * Start Jack
   */

  await startJackDmpAsync(jack, {});

  /**
   * Start Jacktrip
   */

  const client = await startJacktripP2PClientAsync(jacktrip, {});
  // remembered, so the client of one bee can be started again
  p2pClients.set(clientName, client);
};

// the Jacktrip clients on kweenb in P2P mode, by the name of their bee
const p2pClients = new Map<string, RunningCommand>();

/**
 * Plug the cords of a bee in, trying for a while: the inputs of a bee show
 * up in Jack a moment after its stream started
 * @param bee IBee
 */
const makeAudioConnectionsWhenReady = async (bee: IBee) => {
  const connections = getAudioConnections(bee);
  for (let attempt = 0; attempt < 16; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(
      connections.map((connection) =>
        connectChannel(connection).catch(() => false)
      )
    );
    if (results.every(Boolean)) return;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
};

/**
 * Start the stream of one bee again while the swarm stays connected, e.g.
 * after it was switched between mono and stereo. The bee is silent for a
 * few seconds; the other bees are not touched.
 * @param bee IBee, as it has to play from now on
 */
const restartStreamOfBee = (bee: IBee): Promise<void> => {
  // one at a time per bee: two that run together would both replace the
  // connection of the bee and leave one behind
  const earlier = streamRestarts.get(bee.id) || Promise.resolve();
  const restart = earlier.catch(() => {}).then(() => doRestartStreamOfBee(bee));
  streamRestarts.set(bee.id, restart);
  return restart.finally(() => {
    if (streamRestarts.get(bee.id) === restart) streamRestarts.delete(bee.id);
  });
};

// the restarts of a stream that are under way, per bee
const streamRestarts = new Map<number, Promise<void>>();

const doRestartStreamOfBee = async (bee: IBee) => {
  const monitoring = KweenBGlobal.kweenb.beeStates.getMonitoring(bee.id);
  // only a bee that is streaming has a stream to start again
  if (!monitoring || monitoring.stream.state !== "running") return;
  const channels = bee.channelType === ChannelType.STEREO ? 2 : 1;
  const withChannels = <T extends { audio: object }>(request: T): T => ({
    ...request,
    audio: { ...request.audio, channels },
  });

  if (monitoring.stream.mode === "hub") {
    // the bee connects to the hub server again, with one or two channels
    await SpeakerApi.startStream(
      bee.ipAddress,
      withChannels(await Zwerm3ApiHelpers.createHubStreamRequest(hubServer))
    );
  } else if (monitoring.stream.mode === "p2p") {
    const name = getJackClientName(bee);
    // the bee waits for kweenb again
    const started = SpeakerApi.startStream(
      bee.ipAddress,
      withChannels(await Zwerm3ApiHelpers.createP2PStreamRequest())
    );
    started.catch(() => {});
    // the client of this bee on kweenb is replaced by one with the right
    // number of channels
    const client = p2pClients.get(name);
    if (client?.pid) await killProcessByPid(client.pid).catch(() => {});
    p2pClients.delete(name);
    await startJackWithJacktripP2PClient(
      bee.ipAddress,
      START_PORT_JACKTRIP + (bee.id - 1),
      name,
      channels
    );
    await started;
  } else return;

  await makeAudioConnectionsWhenReady(bee);
};

/**
 * The name a bee has in Jack on kweenb: the name the bee itself reports,
 * the name in the database as long as the bee did not report one
 * @param bee IBee
 */
const getJackClientName = (bee: IBee): string =>
  KweenBGlobal.kweenb.beeStates.getMonitoring(bee.id)?.identityName || bee.name;

/**
 * The cords of a bee in Jack: which capture channel goes to which of its
 * inputs. A mono bee has one (its channel plays on both sides), a stereo
 * bee two (left and right). A bee without a channel has none and is silent.
 * @param bee IBee
 */
const getAudioConnections = (
  bee: IBee
): { source: string; destination: string }[] => {
  const name = getJackClientName(bee);
  const connections = [];
  if (bee.channel1 > 0)
    connections.push({
      source: `system:capture_${bee.channel1}`,
      destination: `${name}:send_1`,
    });
  if (bee.channelType === ChannelType.STEREO && (bee.channel2 || 0) > 0)
    connections.push({
      source: `system:capture_${bee.channel2}`,
      destination: `${name}:send_2`,
    });
  return connections;
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
    currentBees.flatMap((bee) =>
      getAudioConnections(bee).map((connection) => connectChannel(connection))
    )
  );
};

/**
 * Make a P2P audio connection from a system device to bee
 * @param bee IBee
 */
const makeP2PAudioConnection = async (bee: IBee) => {
  await Promise.all(
    getAudioConnections(bee).map((connection) => connectChannel(connection))
  );
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
  getAudioConnections,
  getJackClientName,
  restartStreamOfBee,
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
