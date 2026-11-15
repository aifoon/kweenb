/**
 * Shared interfaces
 */

import {
  JacktripHubServerParams,
  RunningCommand,
} from "@zwerm3/jack/dist/interfaces";
import {
  AppMode,
  AudioUploadStatus,
  ChannelType,
  StreamingConnectionStatusType,
} from "./enums";

export interface IError {
  message: string;
  where: string;
}

export interface LoadingState {
  loading: boolean;
  text?: string;
  cancelButton?: boolean;
  onCancel?: () => void;
}

/**
 * For Hub Mode
 */

export interface IHubServerInfo {
  jacktripHubServerParams: JacktripHubServerParams;
  runningCommand: RunningCommand;
}

/**
 * For Streaming (connections)
 */

export interface StreamingConnectionStatus {
  type: StreamingConnectionStatusType;
  message: string;
}

/**
 * For Bee
 */

export interface IBee {
  id: number;
  name: string;
  ipAddress: string;
  isOnline: boolean;
  isActive: boolean;
  isApiOn: boolean;
  status: IBeeStatus;
  channelType: ChannelType;
  channel1: number;
  channel2?: number;
  pozyxTagId?: string;
  // no longer measured: always 0 (kept until the cards stop showing it)
  networkPerformanceMs: number;
  // what the speaker reports about itself (only for a bee that is online)
  monitoring?: IBeeMonitoring;
}

export interface IBeeInput {
  id: number;
  name: string;
  ipAddress: string;
  isActive: boolean;
  channelType: ChannelType;
  channel1: number;
}

export interface IBeeStatus {
  isJackRunning: boolean;
  isJacktripRunning: boolean;
}

export type BeeStreamState = "idle" | "starting" | "running" | "error";

export type BeeStreamMode = "hub" | "p2p" | "trigger";

export type BeeBatteryLevel = "safe" | "warning" | "low";

export interface IBeeStreamInfo {
  state: BeeStreamState;
  mode: BeeStreamMode | null;
  // what went wrong, in words, when the state is error
  error: string | null;
  // how often the audio chain restarted itself since the last start
  restarts: number;
  // dropouts of the sound card since the last start
  xruns: number;
  // late or lost network packets since the last start
  glitches: number;
}

export interface IBeeBattery {
  // false when the bee has no battery sensor
  present: boolean;
  percentage: number | null;
  level: BeeBatteryLevel | null;
  voltage: number | null;
}

export interface IBeeStorage {
  freeMb: number;
  totalMb: number;
}

/**
 * What a bee reports about itself (the status of the zwerm3 API)
 */
export interface IBeeMonitoring {
  apiVersion: string | null;
  // the name the bee has in Jack (e.g. bee21)
  identityName: string | null;
  stream: IBeeStreamInfo;
  battery: IBeeBattery;
  wifiSignalDbm: number | null;
  // the loudest the bee played in the last seconds, in dB below full scale
  // (0 is the loudest, -100 silence); null when the bee does not tell
  outputLevelDb: number | null;
  storage: IBeeStorage | null;
}

export interface IBeeState extends IBeeMonitoring {
  bee: IBee;
  // the last time the bee sent its status
  lastPingResponse: Date | null;
  isApiOn: boolean;
  isJackRunning: boolean;
  isJacktripRunning: boolean;
  // no longer measured: always 0
  networkPerformanceMs: number;
  isOnline: boolean;
}

export interface AudioFile {
  name: string;
  fullPath: string;
  files: { name: string; fullPath: string }[];
}

export interface AudioScene {
  id: number;
  allIds: number[]; // All database IDs for this scene across different bees
  name: string;
  foundOnBees: IBee[];
  oscAddress: string;
  localFolderPath: string;
}

export interface AudioSceneDbRecord {
  id: number;
  name: string;
  beeId: number;
  oscAddress: string;
  localFolderPath: string;
  manuallyAdded: boolean;
}

export interface AudioUploadStatusInfo {
  status: AudioUploadStatus;
  message?: string;
}

export interface CurrentUploadOperation {
  cancelled: boolean;
  beeId?: number;
  // stops the upload that is on its way
  abort?: () => void;
}

/**
 * For new speakers and the sounds that are saved on this computer
 */

// a speaker that was found on the network
export interface IFoundSpeaker {
  hostname: string;
  ipAddress: string;
  // null for a speaker that has no number yet
  id: number | null;
  softwareVersion: string;
  sounds: number;
  freeMb: number;
  // when the speaker was seen for the first time (ISO date)
  foundAt: string;
}

// the sounds of one bee, saved on this computer
export interface ISoundBackup {
  // where the saved sounds are: on this computer (when left out) or only
  // in the cloud
  source?: "computer" | "cloud";
  // the name of the bee the sounds came from (e.g. bee07)
  name: string;
  // when the sounds were saved (ISO date)
  date: string;
  sounds: number;
  sizeBytes: number;
}

// sent while sounds are saved or put back
export interface ISoundsProgress {
  action: "save" | "restore";
  // the bee the sounds are saved from or put back on
  name: string;
  // the sound that is handled now, counted from 1
  current: number;
  total: number;
  sound: string;
}

export interface ISaveSoundsResult {
  // the folder the sounds were saved in
  folder: string;
  saved: { name: string; sounds: number }[];
  // the bees that could not be saved, with the reason in plain words
  failed: { name: string; message: string }[];
  cancelled: boolean;
  // why nothing could be saved at all, in plain words
  message?: string;
}

export interface IRestoreSoundsResult {
  success: boolean;
  sounds: number;
  // the sounds that were taken off the bee (an exact copy only)
  removed?: number;
  cancelled: boolean;
  // what went wrong and what to try, in plain words
  message?: string;
}

export interface IAdoptSpeakerRequest {
  // where the new speaker is now
  ipAddress: string;
  // the number it gets (1 - 99)
  id: number;
  // the saved sounds to put on it (the name of a backup), null for none
  backupName: string | null;
  // where that backup is: on this computer (when left out) or in the cloud
  backupSource?: "computer" | "cloud";
}

// sent while a new speaker is set up
export interface IAdoptSpeakerProgress {
  step: "number" | "waiting" | "sounds";
  // only for the sounds
  current?: number;
  total?: number;
}

export interface IAdoptSpeakerResult {
  // how far it got
  numberGiven: boolean;
  cameBack: boolean;
  soundsRestored: boolean;
  // the number of sounds that are on the speaker now (when they were put back)
  sounds: number;
  // what went wrong and what to try, in plain words
  message?: string;
}

/**
 * For flashing a speaker
 */

// an image that can be written to a speaker
export interface IFlashImage {
  path: string;
  name: string;
  sizeBytes: number;
  // why this file cannot be used, in plain words
  message?: string;
}

// how looking for the speaker to flash ended
export interface IFlashStorageResult {
  found: boolean;
  cancelled: boolean;
  // the size of the storage of the speaker (when it was found)
  sizeBytes: number;
  // what went wrong and what to try, in plain words
  message?: string;
}

// sent while a speaker is looked for and flashed
export interface IFlashProgress {
  step: "looking" | "found" | "password" | "preparing" | "writing" | "checking";
  // only while writing (0 - 100)
  percentage?: number;
}

export interface IFlashSpeakerResult {
  success: boolean;
  cancelled: boolean;
  // what went wrong and what to try, in plain words
  message?: string;
}

/**
 * For Positioning
 */

export interface IPositioningData {
  x: number;
  y: number;
  z: number;
}

export interface IOrientationData {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface ITagData {
  coordinates: IPositioningData;
}

export interface IPozyxData {
  version: string;
  tagId: string;
  success: boolean;
  timestamp: number;
  data: ITagData;
}

export enum PositioningTargetType {
  OscMonitor = "OscMonitor",
  Reaper = "Reaper",
}

export enum PositioningControllerAlgorithm {
  VOLUME_CONTROL_XY,
}

export interface ITargetAndOptionsForPositioningAlgorithm<TAlgorithmOptions> {
  options: TAlgorithmOptions;
  targets: PositioningTargetType[];
}

/**
 * For positioning algorithms
 */

export interface VolumeControlXYOptions {
  bees: IBee[];
  beeRadius: number;
  tagId: string;
  maxVolume: number;
  maxVolumeZoneRadius: number;
  easingIntervalTime: number;
  updateRateEasingFactor: number;
}

/**
 * For Setting
 */

export interface ISetting {
  key: string;
  value: string;
}

/**
 * For Presets
 */

export interface IAudioPreset {
  fileName: string;
  name: string;
  description: string;
  appMode: AppMode;
  maxAllowedBees: number;
  latency: number;
  bee: {
    jack: IAudioSettingsJack;
    jacktrip: IAudioSettingsJackTrip;
  };
  kweenb: {
    jack: IAudioSettingsJack;
    jacktrip: IAudioSettingsJackTrip;
  };
}

/**
 * The Audio Settings for a bee
 */

export interface ISettings {
  beeAudioSettings: IBeeAudioSettings;
  kweenBAudioSettings: IKweenBAudioSettings;
  kweenBSettings: IKweenBSettings;
  positioningSettings: IPositioningSettings;
}

export interface IPositioningSettings {
  updateRate: number;
}

export interface IAudioSettingsJack {
  bufferSize: number;
  device: string;
  inputChannels: number;
  outputChannels: number;
  periods: number;
  sampleRate: number;
}

export interface IAudioSettingsJackTrip {
  bitRate: number;
  // 3 or 4 = conceal late packets (queueBufferLength in milliseconds)
  bufferStrategy: number;
  channels: number;
  redundancy: number;
  queueBufferLength: number;
  realtimePriority: boolean;
  receiveChannels: number;
  sendChannels: number;
  localPort: number;
}

// Bee Audio

export interface IBeeAudioSettings {
  jack: IAudioSettingsJack;
  jacktrip: IAudioSettingsJackTrip;
}

// KweenB

export interface IKweenBAudioSettings {
  jack: IAudioSettingsJack;
  jacktrip: IAudioSettingsJackTrip;
}

export interface IKweenBSettings {
  jackFolderPath: string;
  jacktripBinPath: string;
  // the folder on this computer where the sounds of the bees are saved
  backupFolder: string;
  // the image that was last used to flash a speaker
  lastImagePath: string;
}

// Socket

export interface SocketMessage {
  clientId?: string;
  message: string;
  payload?: any;
}

// Interface specific

export interface BeeAudioScene {
  bee: IBee;
  audioScene: AudioScene | undefined;
  isLooping: boolean;
}

export interface InterfaceComposition {
  id: number;
  name: string;
  composition: BeeAudioScene[];
}

/**
 * Monitoring: how the swarm is doing while KweenB runs
 */

export type MonitorEventKind =
  | "online"
  | "offline"
  | "stream-started"
  | "stream-stopped"
  | "restart"
  | "problem"
  | "late-packets"
  | "dropouts"
  | "battery";

export interface IMonitorEvent {
  id: number;
  // when it happened (and until when, for events that are counted together)
  time: number;
  until: number;
  beeId: number;
  beeName: string;
  kind: MonitorEventKind;
  text: string;
  // how many (late packets, dropouts)
  amount: number;
}

export interface IMonitorBee {
  id: number;
  name: string;
  online: boolean;
  streamState: BeeStreamState | null;
  streamMode: BeeStreamMode | null;
  problem: string | null;
  latePacketsLastMinute: number;
  // counted since monitoring started
  latePackets: number;
  dropouts: number;
  restarts: number;
  timesOffline: number;
  // the late packets of the last half hour, in steps of 30 seconds
  history: number[];
  // false for a bee that does not tell what goes over its Wi-Fi
  measuresNetwork: boolean;
  // what goes over the Wi-Fi of the bee right now (received = from KweenB)
  receivedKbps: number;
  sentKbps: number;
  receivedPacketsPerSecond: number;
  // the speed the Wi-Fi link of the bee runs at
  linkMbps: number | null;
  // sent and received together in kbit/s, in steps of 30 seconds
  networkHistory: number[];
  wifiSignalDbm: number | null;
  // the loudest the bee played in the last seconds (see IBeeMonitoring)
  outputLevelDb: number | null;
  batteryPercentage: number | null;
  batteryLevel: BeeBatteryLevel | null;
}

export interface IMonitorSnapshot {
  // since when is counted
  since: number;
  now: number;
  bees: IMonitorBee[];
  // the newest first
  events: IMonitorEvent[];
}

/**
 * KweenB's own sound device and the routing of its channels to the bees
 */

export interface ISoundDeviceInfo {
  // can this computer have the device at all
  supported: boolean;
  installed: boolean;
  // false when this KweenB comes with a newer device than the installed one
  upToDate: boolean;
  name: string;
  channels: number;
  // does KweenB listen to its own device
  inUse: boolean;
  // the device that was chosen in the settings instead, null when none
  otherDevice: string | null;
  // how many channels that device has, null when not known
  otherDeviceChannels: number | null;
}

// a sound device KweenB can listen to
export interface ISoundDeviceChoice {
  name: string;
  // what is stored in the settings
  uid: string;
  channels: number;
}

export interface IRoutingBee {
  id: number;
  name: string;
  // a stereo bee plays two channels (left and right), a mono bee one
  stereo: boolean;
  // the channel that goes to this bee (to its left side when it is stereo),
  // null when it gets none
  channel: number | null;
  // the channel that goes to the right side of a stereo bee
  channelRight: number | null;
  online: boolean;
}

export interface IRouting {
  soundDevice: ISoundDeviceInfo;
  bees: IRoutingBee[];
}

// a change of the routing of a bee; what is left out stays as it is
export interface IRoutingChange {
  beeId: number;
  stereo?: boolean;
  channel?: number | null;
  channelRight?: number | null;
}

export type SoundDeviceInstallOutcome = "installed" | "cancelled" | "failed";

/**
 * A copy of the saved sounds in the cloud (Cloudflare R2)
 */

export interface ICloudSettings {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  // the secret itself never leaves the main process
  hasSecret: boolean;
}

export interface ICloudSettingsInput {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  // empty keeps the secret that was filled in before
  secretAccessKey: string;
}

// what happened to a backup key (a file with the details of the bucket)
export interface IBackupKeyResult {
  // true when the key was activated or saved
  done: boolean;
  // the bucket of the key
  bucket?: string;
  // the key is encrypted: its (right) passphrase is needed
  needsPassphrase?: boolean;
  // what went wrong, in plain words
  message?: string;
}

export interface ICloudBee {
  // bee07
  name: string;
  // the sounds saved on this computer, and when they were read from the bee
  here: number;
  hereSavedAt: string | null;
  // the sounds of the bee in the cloud, and when those were read from the bee
  inCloud: number;
  cloudSavedAt: string | null;
  // is the cloud the same as what is saved on this computer
  cloudIsCurrent: boolean;
}

export interface ICloudBackupState {
  // false as long as the bucket and the key are not filled in
  configured: boolean;
  // why the cloud could not be looked at, in plain words
  message?: string;
  // the bees that are switched on: the ones a backup can read
  beesOnline?: number;
  // what the cloud does not have yet, and what only the cloud has
  toSend?: { files: number; bytes: number };
  toGet?: { files: number; bytes: number };
  bees?: ICloudBee[];
}

// what backing up the swarm did
export interface ISwarmBackupResult {
  // the bees whose sounds were read, and the ones that could not be read
  saved: { name: string; sounds: number }[];
  notSaved: { name: string; message: string }[];
  // why no bee was read at all (e.g. none is switched on), in plain words
  swarmMessage?: string;
  // the files that went to the cloud
  sentFiles: number;
  cancelled: boolean;
  // why the cloud was not brought up to date, in plain words
  cloudMessage?: string;
}

export interface ICloudProgress {
  direction: "send" | "get";
  // the file that is on its way, counted from 1
  current: number;
  total: number;
  key: string;
  doneBytes: number;
  totalBytes: number;
}

export interface ICloudTransferResult {
  files: number;
  cancelled: boolean;
  // why it did not work, in plain words
  message?: string;
}
