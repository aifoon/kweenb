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
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { ElectronApp } from "./lib";
import {
  registerActions,
  registerIntervalWorkers,
  registerMethods,
} from "./register";
import firstBoot from "./firstboot";

/**
 * Get the resources path
 */
const resourcePath = app.isPackaged
  ? path.join(process.resourcesPath, "assets")
  : path.join(__dirname, "../../assets");

/**
 * Last thing to do when the window is closed
 */
app.on("window-all-closed", () => {
  // Do not respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform === "darwin") {
    app.quit();
  }
});

/**
 * A function that will initialise our application
 */
const initApp = async () => {
  try {
    // when the application is ready
    await app.whenReady();

    // instell react extension
    await installExtension(REACT_DEVELOPER_TOOLS);

    // check if the first start script ran before going further
    await firstBoot();

    // create a new electron app
    const electronApp = new ElectronApp({
      browserWidth: 1024, // sets the browser width
      browserHeight: 728, // sets the browser height
      iconPath: path.join(resourcePath, "icon.png"), // sets the app icon
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

    // on activation
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) electronApp.createWindow();
    });
  } catch (e: any) {
    console.error(e.message);
  }
};

// init the application
initApp();
