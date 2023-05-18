/**
 * A file with some constants
 */

import path from "path";
import { PingConfig } from "ping";

export const DEBUG_JACK_JACKTRIP = false;
export const DEBUG_KWEENB = false;
export const MAIN_PATH = `${
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "..")
    : path.join(__dirname)
}`;
export const SEQUELIZE_LOGGING = false;
export const BEE_POLLING_SECONDS = 5;
export const ZWERM3API_PORT = 3000;
export const DEFAULT_BEE_CONFIG = {
  useMqtt: false,
  mqttBroker: "mqtt://localhost:1883",
  mqttChannel: "beeworker",
  device: "",
};
export const DEFAULT_BEE_STATUS = {
  isJackRunning: false,
  isJacktripRunning: false,
};
export const PING_CONFIG: PingConfig = {
  timeout: 1,
  deadline: 1,
};
export const START_PORT_JACKTRIP = 4464;

// this is the interval in which the positioning controller is called
export const POSITIONING_INTERVAL_MS = 300;
