import { fork, ChildProcess } from "child_process";
import path from "path";
import SatelliteSync from "./lib/Satellite/SatelliteSync";
import { KweenBGlobal } from "./kweenb";

let expressProcess: ChildProcess | null = null;

/**
 * A satellite asked the web server to sync (it holds compositions KweenB
 * does not have yet). The work is done here, the answer goes back.
 */
const answerSatellite = async (message: any) => {
  if (!message || message.type !== "satellite-sync") return;
  const { id, host, port } = message;
  try {
    const result = await SatelliteSync.syncWithSatellite(
      String(host),
      Number(port)
    );
    expressProcess?.send({
      type: "satellite-sync-result",
      id,
      ok: true,
      result,
    });

    // tell whoever sits at KweenB what came in
    const fromSatellite =
      result.added.length +
      result.updated.length +
      result.keptBoth.length +
      result.deleted.length;
    if (fromSatellite > 0)
      KweenBGlobal.kweenb.showInfo(
        fromSatellite === 1
          ? `1 change to the compositions came in from ${result.satelliteName}.`
          : `${fromSatellite} changes to the compositions came in from ${result.satelliteName}.`
      );
  } catch (e: any) {
    expressProcess?.send({
      type: "satellite-sync-result",
      id,
      ok: false,
      error: e?.message || "The sync with the satellite failed.",
    });
  }
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
  expressProcess = fork(serverUrl);
  try {
    if (expressProcess) {
      expressProcess.stdout?.on("data", console.log);
      expressProcess.stderr?.on("data", console.error);
      expressProcess.on("message", answerSatellite);
    }
    return expressProcess;
  } catch (e) {
    return null;
  }
};
