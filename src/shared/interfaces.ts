/**
 * Shared interfaces
 */

export interface IError {
  message: string;
  where: string;
}

/**
 * For The Kween
 */

export interface IHubClients {
  sendChannels: string[];
  receiveChannels: string[];
}

export interface IHubClientsResponse {
  message: string;
  hubClients: IHubClients;
}

/**
 * For Bee
 */

export enum ChannelType {
  MONO = "mono",
  STEREO = "stereo",
}

export interface IBee {
  id: number;
  name: string;
  ipAddress: string;
  isOnline: boolean;
  isActive: boolean;
  isApiOn: boolean;
  config: IBeeConfig;
  status: IBeeStatus;
  channelType: ChannelType;
  channel1: number;
  channel2?: number;
  pozyxTagId?: string;
}

export interface IBeeInput {
  id: number;
  name: string;
  ipAddress: string;
  isActive: boolean;
  channelType: ChannelType;
  channel1: number;
}

export interface IBeeConfig {
  useMqtt: boolean;
  mqttBroker: string;
  mqttChannel: string;
  device: string;
}

export interface IBeeStatus {
  isJackRunning: boolean;
  isJacktripRunning: boolean;
}

export interface ISystemClients {
  captureChannels: string[];
  playbackChannels: string[];
}

export interface ISystemClientsResponse {
  message: string;
  systemClients: ISystemClients;
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
 * The Audio Settings for a bee
 */

export interface ISettings {
  beeAudioSettings: IBeeAudioSettings;
  kweenBAudioSettings: IKweenBAudioSettings;
  kweenBSettings: IKweenBSettings;
  theKweenSettings: ITheKweenSettings;
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
}

// The Kween

export interface ITheKween {
  settings: ITheKweenSettings;
  isOnline: boolean;
  isApiOn: boolean;
}

export interface ITheKweenSettings {
  ipAddress: string;
}
