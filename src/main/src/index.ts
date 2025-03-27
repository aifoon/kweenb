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
import { ElectronApp } from "./lib";
import { registerActionListeners, registerMethodHandlers } from "./register";
import firstBoot from "./firstboot";
import KweenBHelpers from "./lib/KweenB/KweenBHelpers";
import { KweenB, KweenBGlobal } from "./kweenb";

/**
 * Get the resources path
 */
const buildResourcePath = app.isPackaged
  ? path.join(__dirname, "..", "..", "..")
  : path.join(__dirname, "..", "..", "..", "buildResources");

/**
 * Last thing to do when the window is closed
 */
app.on("window-all-closed", async () => {
  // Do not respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform === "darwin" || process.platform === "linux") {
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

    // check if the first start script ran before going further
    await firstBoot();

    // create new KweenB instance
    KweenBGlobal.kweenb = new KweenB();

    // init before window
    await KweenBGlobal.kweenb.initBeforeWindow();

    // create a new electron app
    const electronApp = new ElectronApp({
      browserWidth: 1024, // sets the browser width
      browserHeight: 728, // sets the browser height
      iconPath: path.join(buildResourcePath, "icon.icns"), // sets the app icon
      installExtensions: false, // shall we install react dev tools?
    });

    // create hte window
    const mainWindow = await electronApp.createWindow();

    // when we have a main window and its web contents
    if (mainWindow && mainWindow.webContents) {
      // when the dom is ready
      mainWindow.webContents.on("dom-ready", async () => {
        // send a loading message to the renderer
        KweenBGlobal.kweenb.setLoader(true);

        // register actions to execute
        // (one way direction, from renderer to main)
        registerActionListeners();

        // register the methods to handle
        // (two way direction, from renderer to main and back)
        registerMethodHandlers();

        // init the kweenb internal logic
        // this will pass settings to external libs, initialize dictionaries and workers etc.
        await KweenBGlobal.kweenb.initAfterWindow((message) => {
          KweenBGlobal.kweenb.setLoader(true, message);
        });

        // stop loading
        KweenBGlobal.kweenb.setLoader(false);
      });
    }

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
      await KweenBHelpers.closeApplication(KweenBGlobal.kweenb.appMode);
      app.exit(0);
    });
  } catch (e: any) {
    console.error(e.message);
  }
};

// init the application
initApp();
