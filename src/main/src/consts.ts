/**
 * A file with some constants
 */

import path from "path";
import { PingConfig } from "ping";

export const MAIN_PATH = `${path.join(process.cwd(), "src", "main")}`;
export const MAIN_SRC_PATH = `${path.join(MAIN_PATH, "src")}`;
export const SEQUELIZE_LOGGING = false;
export const BEE_POLLING_SECONDS = 5;
export const ZWERM3API_PORT = 3000;
export const DEFAULT_BEE_CONFIG = {
  jacktripVersion: "1.5.3",
  useMqtt: false,
};
export const DEFAULT_BEE_STATUS = {
  isJackRunning: false,
  isJacktripRunning: false,
};
export const PING_CONFIG: PingConfig = {
  timeout: 1,
  deadline: 1,
};
