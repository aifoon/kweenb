/**
 * The Main Electron App class
 */

import path from "path";
import { URL } from "url";
import { BrowserWindow, shell } from "electron";
import MenuBuilder from "./Menu";
import { KweenB, KweenBGlobal } from "../kweenb";
import IntervalWorkerList from "./Interval/IntervalWorkerList";
import BeesPoller from "./Interval/BeesPoller";

interface ElectronAppOptions {
  browserWidth?: number;
  browserHeight?: number;
  iconPath?: string;
  installExtensions?: boolean;
}

export default class ElectronApp {
  private isDevelopment: boolean;

  private isProduction: boolean;

  private port: string | number | undefined;

  private options: ElectronAppOptions;

  constructor(
    options: ElectronAppOptions = {
      browserWidth: 1024,
      browserHeight: 728,
      iconPath: "",
      installExtensions: false,
    }
  ) {
    this.options = options;
    this.isDevelopment =
      process.env.NODE_ENV === "development" ||
      process.env.DEBUG_PROD === "true";
    this.isProduction = process.env.NODE_ENV === "production";
    this.port = process.env.PORT || 3000;
  }

  /**
   * Resolve the HTML path, based on staging
   *
   * @param htmlFileName
   * @returns
   */
  resolveHtmlPath(htmlFileName: string): string {
    if (this.isDevelopment) {
      const url = new URL(`http://localhost:${this.port}`);
      url.pathname = htmlFileName;
      return url.href;
    }
    return `file://${path.resolve(__dirname, "../renderer/", htmlFileName)}`;
  }

  /**
   * Creates a new Electron window
   *
   * @returns a BrowserWindow
   */
  async createWindow(): Promise<BrowserWindow | null> {
    // create an internal variable to work with
    let mainWindow: BrowserWindow | null = null;

    // create a new main window
    mainWindow = new BrowserWindow({
      show: false,
      width: this.options.browserWidth,
      height: this.options.browserHeight,
      icon: this.options?.iconPath ? this.options.iconPath : "",
      webPreferences: {
        nativeWindowOpen: true,
        preload: path.join(__dirname, "../src/preload/dist/index.cjs"),
      },
    });

    // load the index html page
    mainWindow.loadURL(this.resolveHtmlPath("index.html"));

    // when we are ready to go
    mainWindow.on("ready-to-show", () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) mainWindow.minimize();
      else mainWindow.show();
    });

    // when we are closing, destroy the main window
    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    // creates the menu
    const menuBuilder = new MenuBuilder(mainWindow, this.isDevelopment);
    menuBuilder.buildMenu();

    // open urls in the user's browser
    mainWindow.webContents.on("new-window", (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    // sets the mainWindow in a global state
    KweenBGlobal.kweenb = new KweenB(mainWindow);

    // return the window
    return mainWindow;
  }
}
