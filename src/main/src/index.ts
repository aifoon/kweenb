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
import registerActions from "./registerActions";

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
 * Start the electron app when we are ready
 */
app
  .whenReady()
  .then(() => {
    // create a new electron app
    const electronApp = new ElectronApp({
      browserWidth: 1024, // sets the browser width
      browserHeight: 728, // sets the browser height
      iconPath: path.join(resourcePath, "icon.png"), // sets the app icon
      installExtensions: false, // shall we install react dev tools?
    });

    // create hte window
    const mainWindow = electronApp.createWindow();

    // register actions to handle
    registerActions();

    // on activation
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) electronApp.createWindow();
    });
  })
  .catch(console.error);
