/**
 * Shared interfaces
 */

import { AppMode, ChannelType } from "./enums";

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
  networkPerformanceMs: number;
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

export interface IBeeState {
  bee: IBee;
  lastPingResponse: Date | null;
  isApiOn: boolean;
  isJackRunning: boolean;
  isJacktripRunning: boolean;
  networkPerformanceMs: number;
}

export interface ISystemClients {
  captureChannels: string[];
  playbackChannels: string[];
}

export interface ISystemClientsResponse {
  message: string;
  systemClients: ISystemClients;
}

export interface AudioFile {
  name: string;
  fullPath: string;
  files: { name: string; fullPath: string }[];
}

export interface AudioScene {
  id: number;
  name: string;
  foundOnBees: IBee[];
  oscAddress: string;
  localFolderPath: string;
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
