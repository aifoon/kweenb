/**
 * A file with default settings.
 * Only the settings that change how kweenb and the bees behave are stored;
 * everything else is a fixed value in lib/KweenB/SettingHelpers.ts
 */

import { SETTINGS_VERSION } from "../consts";

export default [
  // the audio format of the stream, the same on kweenb and on every bee
  {
    key: "audioSampleRate",
    value: "44100",
  },
  {
    key: "audioBufferSize",
    value: "512",
  },
  {
    key: "audioBitRate",
    value: "16",
  },
  // the buffer on the bee that waits for late network packets (milliseconds)
  {
    key: "beeJacktripQueueBufferLength",
    value: "30",
  },
  // the number of blocks in the sound card buffer of the bee
  {
    key: "beeJackPeriods",
    value: "3",
  },
  // the audio device Jack opens on kweenb (empty = system default)
  {
    key: "kweenbJackDevice",
    value: "",
  },
  // how many times kweenb sends each audio packet
  {
    key: "kweenbJacktripRedundancy",
    value: "1",
  },
  // the folder where the sounds of the bees are saved
  // (empty = "KweenB Backups" in the Documents folder)
  {
    key: "kweenbBackupFolder",
    value: "",
  },
  {
    key: "positioningUpdateRate",
    value: "500",
  },
  {
    key: "settingsVersion",
    value: SETTINGS_VERSION,
  },
];
