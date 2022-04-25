/**
 * Shared interfaces
 */

export interface IError {
  message: string;
  where: string;
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
  jacktripVersion: string;
  useMqtt: boolean;
  mqttBroker: string;
  mqttChannel: string;
}

export interface IBeeStatus {
  isJackRunning: boolean;
  isJacktripRunning: boolean;
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

export interface IKweenBSettings {
  beeAudioSettings: IBeeAudioSettings;
  kweenBAudioSettings: IKweenBAudioSettings;
  theKweenSettings: ITheKweenSettings;
}

// Bee Audio

export interface IBeeAudioSettings {
  channels: number;
  jack: IBeeAudioSettingsJack;
  jacktrip: IBeeAudioSettingsJackTrip;
}

export interface IBeeAudioSettingsJack {
  device: string;
  bufferSize: number;
  sampleRate: number;
  periods: number;
}

export interface IBeeAudioSettingsJackTrip {
  bitRate: number;
  redundancy: number;
  queueBufferLength: number;
  realtimePriority: boolean;
  receiveChannels: number;
  sendChannels: number;
}

// KweenB

export interface IKweenBAudioSettings {
  channels: number;
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
