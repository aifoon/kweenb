/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import path from "path";
import { app } from "electron";
// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";
import aedes from "aedes";
import net from "net";
import { ElectronApp } from "./lib";
import {
  registerActions,
  registerIntervalWorkers,
  registerMethods,
} from "./register";
import firstBoot from "./firstboot";
import KweenBHelpers from "./lib/KweenB/KweenBHelpers";
import { KweenBGlobal } from "./kweenb";

/**
 * Get the resources path
 */
const resourcePath = app.isPackaged
  ? path.join(__dirname, "..", "..", "..")
  : path.join(__dirname, "..", "..", "..", "buildResources");

/**
 * Last thing to do when the window is closed
 */
app.on("window-all-closed", async () => {
  // Do not respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform === "darwin") {
    app.quit();
  }
});

/**
 * Create internal MQTT broker
 */
const a = aedes();
const aedesServer = net.createServer(a.handle);

/**
 * A function that will initialise our application
 */
const initApp = async () => {
  try {
    // when the application is ready
    await app.whenReady();

    // install react extension
    // await installExtension(REACT_DEVELOPER_TOOLS);

    // check if the first start script ran before going further
    await firstBoot();

    // create a new electron app
    const electronApp = new ElectronApp({
      browserWidth: 1024, // sets the browser width
      browserHeight: 728, // sets the browser height
      iconPath: path.join(resourcePath, "icon.icns"), // sets the app icon
      installExtensions: false, // shall we install react dev tools?
    });

    // create hte window
    const mainWindow = await electronApp.createWindow();

    // register actions to execute
    // (one way direction, from renderer to main)
    registerActions();

    // register the methods to handle
    // (two way direction, from renderer to main and back)
    registerMethods();

    // create interval workers
    // these will do the dirty work, polling, etc.
    registerIntervalWorkers();

    // creates an internal MQTT broker
    aedesServer.listen(1883);

    // on activation
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) electronApp.createWindow();
    });

    /**
     * Before quiting, close the kweenb application by killing all other processes
     */
    app.on("before-quit", async (event: any) => {
      event.preventDefault();

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("closing");
      }
      if (aedesServer && aedesServer.listening) await aedesServer.close();
      await KweenBHelpers.closeApplication(KweenBGlobal.kweenb.appMode);
      app.exit(0);
    });
  } catch (e: any) {
    console.error(e.message);
  }
};

// init the application
initApp();
