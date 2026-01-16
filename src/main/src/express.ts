import { fork, ChildProcess } from "child_process";
import path from "path";
import { app } from "electron";
import { resourcesPath } from "@shared/resources";

let expressProcess: ChildProcess | null = null;

/**
 * Get the database path based on environment
 */
const getDatabasePath = (): string => {
  return process.env.NODE_ENV === "development"
    ? "kweenb.sqlite"
    : path.join(app.getPath("userData"), "kweenb.sqlite");
};

/**
 * Kll the express process
 */
export const killExpress = () => {
  if (expressProcess && !expressProcess.killed) {
    expressProcess.kill("SIGINT");
  }
};

/**
 * Init the express application
 * @returns
 */
export const initExpress = (): ChildProcess | null => {
  // get the server url, based on the environment
  const serverUrl =
    import.meta.env.MODE === "production"
      ? path.resolve(__dirname, "server.js")
      : path.resolve(__dirname, "../public/server.js");

  // start the express process
  expressProcess = fork(serverUrl, {
    env: {
      ...process.env,
      KWEENB_DB_PATH: getDatabasePath(),
    },
  });
  try {
    if (expressProcess) {
      expressProcess.stdout?.on("data", console.log);
      expressProcess.stderr?.on("data", console.error);
    }
    return expressProcess;
  } catch (e) {
    return null;
  }
};
