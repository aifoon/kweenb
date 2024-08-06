import { fork, ChildProcess } from "child_process";
import path from "path";

let expressProcess: ChildProcess | null = null;

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
