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

export interface IBee {
  id: number;
  name: string;
  ipAddress: string;
  isOnline: boolean;
  isActive: boolean;
  isApiOn: boolean;
  config: IBeeConfig;
  status: IBeeStatus;
}

export interface IBeeInput {
  id: number;
  name: string;
  ipAddress: string;
  isActive: boolean;
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
  mqttBroker: string;
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
