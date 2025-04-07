const { createServer, build, createLogger } = require("vite");
const electronPath = require("electron");
const { spawn } = require("child_process");

/** @type 'production' | 'development'' */
const mode = (process.env.MODE = process.env.MODE || "development");

/** @type {import('vite').LogLevel} */
const LOG_LEVEL = "info";

/** @type {import('vite').InlineConfig} */
const sharedConfig = {
  mode,
  build: {
    watch: {},
  },
  logLevel: LOG_LEVEL,
};

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
  // warning about devtools extension
  // https://github.com/cawa-93/vite-electron-builder/issues/492
  // https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
  /ExtensionLoadWarning/,
];

/**
 * @param {{name: string; configFile: string; writeBundle: import('rollup').OutputPlugin['writeBundle'] }} param0
 */
const getWatcher = ({ name, configFile, writeBundle }) => {
  return build({
    ...sharedConfig,
    configFile,
    plugins: [{ name, writeBundle }],
  });
};

/**
 * Start or restart App when source files are changed
 * @param {{config: {server: import('vite').ResolvedServerOptions}}} ResolvedServerOptions
 */
const setupMainPackageWatcher = ({ config: { server } }) => {
  // Create VITE_DEV_SERVER_URL environment variable to pass it to the main process.
  {
    const protocol = server.https ? "https:" : "http:";
    const host = server.host || "localhost";
    const port = server.port; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
    process.env.VITE_DEV_SERVER_PORT = port;
    process.env.VITE_DEV_SERVER_HOST = host;
    process.env.VITE_DEV_SERVER_URL = `${protocol}//${host}:${port}`;
  }

  const logger = createLogger(LOG_LEVEL, {
    // prefix: "[main]",
  });

  /** @type {ChildProcessWithoutNullStreams | null} */
  let spawnProcess = null;

  return getWatcher({
    name: "reload-app-on-main-package-change",
    configFile: "src/main/vite.config.js",
    writeBundle() {
      if (spawnProcess !== null) {
        spawnProcess.off("exit", process.exit);
        spawnProcess.kill("SIGINT");
        spawnProcess = null;
      }

      spawnProcess = spawn(String(electronPath), ["."]);

      spawnProcess.stdout.on(
        "data",
        (d) => d.toString().trim() && console.log(d.toString())
      );
      spawnProcess.stderr.on("data", (d) => {
        const data = d.toString().trim();
        if (!data) return;
        const mayIgnore = stderrFilterPatterns.some((r) => r.test(data));
        if (mayIgnore) return;
        logger.error(data, { timestamp: true });
      });

      // Stops the watch script when the application has been quit
      spawnProcess.on("exit", process.exit);
    },
  });
};

/**
 * Start or restart App when source files are changed
 * @param {{ws: import('vite').WebSocketServer}} WebSocketServer
 */
const setupPreloadPackageWatcher = ({ ws }) =>
  getWatcher({
    name: "reload-page-on-preload-package-change",
    configFile: "src/preload/vite.config.js",
    writeBundle() {
      ws.send({
        type: "full-reload",
      });
    },
  });

/**
 * Start or restart App when source files are changed
 * @param {{ws: import('vite').WebSocketServer}} WebSocketServer
 */
const setupInterfacePackageWatcher = ({ ws }) =>
  getWatcher({
    name: "reload-page-on-interface-package-change",
    configFile: "src/interface/vite.config.js",
    writeBundle() {
      ws.send({
        type: "full-reload",
      });
    },
  });

(async () => {
  try {
    const viteDevServer = await createServer({
      ...sharedConfig,
      configFile: "src/renderer/vite.config.js",
    });

    await viteDevServer.listen();
    await setupPreloadPackageWatcher(viteDevServer);
    await setupMainPackageWatcher(viteDevServer);

    /**
     * The interface application for touch screen devices
     */

    const spinViteDevServerInterface = false;
    if (spinViteDevServerInterface) {
      const viteDevServerInterface = await createServer({
        ...sharedConfig,
        root: `${__dirname}/../src/main/public/webserver`,
        configFile: "src/interface/vite.config.js",
      });
      await viteDevServerInterface.listen();
      await setupInterfacePackageWatcher(viteDevServerInterface);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
