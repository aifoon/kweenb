/**
 * A File With Interfaces
 */

/**
 * The KweenB interfaces
 */

export interface Setting {
  key: string;
  value: string;
}

/**
 * The internal configuration of a bee (zwerm3api)
 */

export interface BeeConfig {
  jacktripVersion: string;
  useMqtt: boolean;
}

export interface BeeConfigItem {
  key: string;
  value: string;
}

/**
 * The Audio Settings for a bee
 */

export interface BeeAudioSettingsJack {
  bufferSize: 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;
  sampleRate: 22050 | 32000 | 44100 | 48000 | 88200 | 96000 | 192000;
}

export interface BeeAudioSettingsJackTrip {
  bitRate: 8 | 16 | 24 | 32;
  redundancy: number;
  queueBufferLength: number;
}

export interface BeeAudioSettings {
  channels: number;
  jack: BeeAudioSettingsJack;
  jacktrip: BeeAudioSettingsJackTrip;
}
