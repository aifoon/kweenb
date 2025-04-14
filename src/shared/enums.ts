/**
 * Shared Enums
 */

export enum BeeActiveState {
  INACTIVE = 0,
  ACTIVE = 1,
  ALL = 2,
}

export enum BeeDeviceManagerActions {
  SHUTDOWN = 0,
  REBOOT = 1,
}

export enum AppMode {
  Hub = "hub",
  P2P = "p2p",
}

export enum AppViews {
  Swarm = "swarm",
  Audio = "audio",
  Positioning = "positioning",
  Settings = "settings",
  Tools = "tools",
}

export enum PDAudioParam {
  VOLUME = "volume",
  LOW = "low",
  MID = "mid",
  HIGH = "high",
  USE_EQ = "use_eq",
  FILE_LOOP = "file_loop",
}

export enum ChannelType {
  MONO = "mono",
  STEREO = "stereo",
}

export enum StreamingConnectionStatusType {
  IDLE = "IDLE",
  INFO = "INFO",
  ERROR = "ERROR",
  SUCCES = "EXIT",
}
