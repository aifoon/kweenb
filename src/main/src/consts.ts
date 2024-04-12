/**
 * A file with some constants
 */

import path, { join } from "path";
import { PingConfig } from "ping";
import { app } from "electron";

export const DEBUG_JACK_JACKTRIP = false;
export const DEBUG_KWEENB = false;
export const MAIN_PATH = `${
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "..")
    : path.join(__dirname)
}`;

// the path to the private key we use for SSH connections
export const SSH_PRIVATE_KEY_PATH = `${
  process.env.NODE_ENV === "development"
    ? "kweenb.key"
    : join(app.getPath("userData"), "kweenb.key")
}`;
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

// the default configuration of a bee
export const DEFAULT_BEE_CONFIG = {
  useMqtt: false,
  mqttBroker: "mqtt://localhost:1883",
  mqttChannel: "beeworker",
  device: "",
};

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

/**
 * Positioning
 */

// this is the interval in which the positioning controller is called
export const POSITIONING_INTERVAL_MS = 200;
export const OSCMONITOR_PORT = 8110;
export const REAPER_OSC_PORT = 8111;
