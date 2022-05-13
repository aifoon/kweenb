/**
 * A file with some constants
 */

import path from "path";
import { PingConfig } from "ping";

export const MAIN_PATH = `${
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "..")
    : path.join(__dirname)
}`;
export const SEQUELIZE_LOGGING = false;
export const BEE_POLLING_SECONDS = 5;
export const ZWERM3API_PORT = 3000;
export const DEFAULT_BEE_CONFIG = {
  jacktripVersion: "1.5.3",
  useMqtt: false,
  mqttBroker: "mqtt://localhost:1883",
  mqttChannel: "beeworker",
};
export const DEFAULT_BEE_STATUS = {
  isJackRunning: false,
  isJacktripRunning: false,
};
export const PING_CONFIG: PingConfig = {
  timeout: 1,
  deadline: 1,
};
