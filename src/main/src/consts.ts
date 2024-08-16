/**
 * A file with some constants
 */

import path from "path";
import { PingConfig } from "ping";
import { resourcesPath } from "@shared/resources";
import { app } from "electron";

export const DEBUG_JACK_JACKTRIP = true;
export const DEBUG_KWEENB = false;
export const MAIN_PATH = `${
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "..")
    : path.join(__dirname)
}`;

// the path to the private key we use for SSH connections
export const SSH_PRIVATE_KEY_PATH = `${resourcesPath}/kweenb.key`;

// the path to the SSL keys
export const SSL_KEY = `${resourcesPath}/ssl/key.pem`;
export const SSL_CERT = `${resourcesPath}/ssl/cert.pem`;

// the username we use for SSH connections
export const SSH_USERNAME_BEE = "pi";

// turn on/off logging for the sequelize database
export const SEQUELIZE_LOGGING = false;

// the interval we use to poll a bee for its status
export const BEE_POLLING_SECONDS = 2;

// the amount of seconds a bee is considered to be offline
export const BEE_CONSIDERED_OFFLINE_SECONDS = 10;

// the interval we use to poll a bee for its network performance (check each x seconds)
export const NETWORK_PERFORMANCE_POLLING_SECONDS = 5;

// the port on which the ZWERM3 API is running
export const ZWERM3API_PORT = 3000;

// the audio file path root directory on the pi
export const AUDIO_FILES_ROOT_DIRECTORY = "/home/pi/pd-bee/files";

// the default configuration of a bee
export const DEFAULT_BEE_CONFIG = {
  useMqtt: false,
  mqttBroker: "mqtt://localhost:1883",
  mqttChannel: "beeworker",
  device: "",
};

// the user data path
export const USER_DATA =
  process.env.NODE_ENV === "development"
    ? `${resourcesPath}`
    : path.join(app.getPath("userData"));

// the path to the presets folder
export const PRESETS_FOLDER_PATH = path.join(USER_DATA, "presets");

// the default status of a bee
export const DEFAULT_BEE_STATUS = {
  isJackRunning: false,
  isJacktripRunning: false,
};
export const PING_CONFIG: PingConfig = {
  timeout: 1,
  deadline: 1,
};

// the starting port of jacktrip
export const START_PORT_JACKTRIP = 4464;

// the port of the jacktrip HUB server
export const JACKTRIP_HUB_PORT = 4495;

// the jacktrip download version
export const JACKTRIP_DOWNLOAD_VERSION = "2.2.5";

// the jack download version
export const JACK_DOWNLOAD_VERSION = "1.9.22";

/**
 * Positioning
 */

// this is the interval in which the positioning controller is called
export const POSITIONING_INTERVAL_MS = 200;
export const OSCMONITOR_PORT = 8110;
export const REAPER_OSC_PORT = 8111;
