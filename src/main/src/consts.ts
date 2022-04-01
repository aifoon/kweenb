/**
 * A file with some constants
 */

import path from "path";

export const MAIN_PATH = `${path.join(process.cwd(), "src", "main")}`;
export const MAIN_SRC_PATH = `${path.join(MAIN_PATH, "src")}`;
export const SEQUELIZE_LOGGING = false;
export const BEE_POLLING_SECONDS = 5;
export const ZWERM3API_PORT = 3000;
