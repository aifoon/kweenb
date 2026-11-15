/**
 * The Zwerm3API Helpers: what kweenb asks of the API on a bee, built from
 * the settings of kweenb
 */

import { IBee, IHubServerInfo } from "@shared/interfaces";
import { ChannelType } from "@shared/enums";
import ip from "ip";
import { START_PORT_JACKTRIP_HUB_SERVER } from "../../consts";
import SettingHelpers from "./SettingHelpers";
import SpeakerApi, {
  SpeakerAudioFormat,
  SpeakerStreamRequest,
} from "./SpeakerApi";

/**
 * A bee on which something failed, with the message of the bee itself
 */
export interface BeeFailure {
  bee: IBee;
  message: string;
}

/**
 * The audio format of the stream, the same for every bee
 */
const getAudioFormat = async (): Promise<SpeakerAudioFormat> => {
  const { beeAudioSettings } = await SettingHelpers.getAllSettings();
  return {
    sampleRate: beeAudioSettings.jack.sampleRate,
    bufferSize: beeAudioSettings.jack.bufferSize,
    bitRate: beeAudioSettings.jacktrip.bitRate,
    periods: beeAudioSettings.jack.periods,
    networkBuffer: beeAudioSettings.jacktrip.queueBufferLength,
  };
};

/**
 * The request that lets a bee connect to the Jacktrip hub server on kweenb
 * @param hubServerInfo The running hub server, the default port if left out
 */
const createHubStreamRequest = async (
  hubServerInfo: IHubServerInfo | null = null
): Promise<SpeakerStreamRequest> => ({
  mode: "hub",
  host: ip.address(),
  port: hubServerInfo
    ? hubServerInfo.jacktripHubServerParams.localPort
    : START_PORT_JACKTRIP_HUB_SERVER,
  audio: await getAudioFormat(),
});

/**
 * The request that lets a bee wait for a Jacktrip connection from kweenb
 */
const createP2PStreamRequest = async (): Promise<SpeakerStreamRequest> => {
  const { beeAudioSettings } = await SettingHelpers.getAllSettings();
  return {
    mode: "p2p",
    port: beeAudioSettings.jacktrip.localPort,
    audio: await getAudioFormat(),
  };
};

/**
 * The request that lets a bee only play its audio scenes (no stream)
 */
const createTriggerStreamRequest = async (): Promise<SpeakerStreamRequest> => ({
  mode: "trigger",
  audio: await getAudioFormat(),
});

/**
 * Do something on several bees at once and wait for all of them
 * @param bees The bees
 * @param action What to do on a bee
 * @returns The bees on which it failed, with the reason
 */
const onBees = async (
  bees: IBee[],
  action: (bee: IBee) => Promise<unknown>
): Promise<BeeFailure[]> => {
  const results = await Promise.allSettled(bees.map((bee) => action(bee)));
  const failures: BeeFailure[] = [];
  results.forEach((result, index) => {
    if (result.status === "rejected")
      failures.push({
        bee: bees[index],
        message: result.reason?.message || String(result.reason),
      });
  });
  return failures;
};

/**
 * Describe the bees on which something failed, e.g.
 * "bee07: Jacktrip did not start (...); bee12: The speaker can not be reached"
 * @param failures
 */
const describeFailures = (failures: BeeFailure[]): string =>
  failures.map(({ bee, message }) => `${bee.name}: ${message}`).join("; ");

/**
 * Start the audio chain (Jack, Jacktrip and Pure Data) on several bees.
 * Every bee is waited for; the error names each bee that failed.
 * @param bees The bees
 * @param streamRequest What to start
 */
const startStreamOnBees = async (
  bees: IBee[],
  streamRequest: SpeakerStreamRequest
) => {
  // a stereo bee gets two channels, a mono bee one
  const failures = await onBees(bees, (bee) =>
    SpeakerApi.startStream(bee.ipAddress, {
      ...streamRequest,
      audio: {
        ...streamRequest.audio,
        channels: bee.channelType === ChannelType.STEREO ? 2 : 1,
      },
    })
  );
  if (failures.length > 0) throw new Error(describeFailures(failures));
};

/**
 * Stop the audio chain on several bees.
 * Every bee is waited for; the error names each bee that failed.
 * @param bees The bees
 */
const stopStreamOnBees = async (bees: IBee[]) => {
  const failures = await onBees(bees, (bee) =>
    SpeakerApi.stopStream(bee.ipAddress)
  );
  if (failures.length > 0) throw new Error(describeFailures(failures));
};

export default {
  createHubStreamRequest,
  createP2PStreamRequest,
  createTriggerStreamRequest,
  describeFailures,
  onBees,
  startStreamOnBees,
  stopStreamOnBees,
};
