/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/**
 * A KweenB instance that will control the requests coming from renderer
 */

import { AppMode } from "@shared/enums";
import { CurrentUploadOperation, IError } from "@shared/interfaces";
import { app, BrowserWindow } from "electron";
import SatelliteSync from "./lib/Satellite/SatelliteSync";
import { Zwerm3Jack } from "@zwerm3/jack";
import SettingHelpers from "./lib/KweenB/SettingHelpers";
import BeeStatesWorker from "./lib/KweenB/BeeStatesWorker";
import { resourcesPath } from "@shared/resources";
import fs from "fs";
import path from "path";
import { USER_DATA } from "./consts";
import {
  jackFolderFor,
  jacktripBinFor,
  useJackFolder,
} from "./lib/KweenB/BundledJack";
import { initExpress } from "./express";
import { initSocketIo } from "./socket";
import Database from "./database";

/**
 * A KweenB class
 */
class KweenB {
  private _mainWindow: BrowserWindow;

  private _appMode: AppMode;

  private _beeStatesWorker: BeeStatesWorker;

  // stops announcing KweenB on the network (for the satellite)
  private _stopAnnouncing: (() => void) | null = null;

  private _currentUploadOperation: CurrentUploadOperation | null;

  constructor() {
    this._appMode = AppMode.P2P;
  }

  /**
   * Getters & Setters
   */

  public get mainWindow() {
    return this._mainWindow;
  }

  public get appMode() {
    return this._appMode;
  }

  public set appMode(appMode: AppMode) {
    this._appMode = appMode;
  }

  public get beeStates() {
    return this._beeStatesWorker.beeStates;
  }

  public get beeStatesWorker() {
    return this._beeStatesWorker;
  }

  public set mainWindow(mainWindow: BrowserWindow) {
    this._mainWindow = mainWindow;
  }

  /**
   * Current upload operations in kweenb
   */
  public set currentUploadOperation(
    currentUploadOperation: CurrentUploadOperation | null
  ) {
    this._currentUploadOperation = currentUploadOperation;
  }

  /**
   * Current upload operations in kweenb
   */
  public get currentUploadOperation() {
    return this._currentUploadOperation;
  }

  /**
   * Init KweenB functions
   */

  /**
   * This is an initializer, to init settinges, etc. on boot, before window is created
   * initJackFolderPath: inits the jackfolder whenever we find one in the database
   * initJacktripBinPath: inits the jacktrip binary whenever we find one in the database
   */
  public async initBeforeWindow() {
    // sync the database
    await Database.sync();

    // bring the settings of an earlier version up to date
    await SettingHelpers.migrateSettings();

    // the File menu shows whether a backup key is installed (loaded here,
    // because that controller needs this module itself)
    import("./controllers/cloud-backup")
      .then(({ showBackupMenu }) => showBackupMenu())
      .catch(() => {});

    // tidy up after an earlier version of KweenB
    this.removeDownloadedJack();

    // init the jack folder path
    await this.initJackFolderPath();

    // init the jacktrip binary path
    await this.initJacktripBinPath();

    // init the express server
    initExpress();
  }

  /**
   * This is an initializer that wil happen after the window is created
   * @param callback A callback function to send messages to the renderer
   */
  public async initAfterWindow(callback: (message: string) => void) {
    // init the bee states worker
    this._beeStatesWorker = new BeeStatesWorker();
    await this._beeStatesWorker.init();

    // Only now the remote interface may connect: its first question is
    // about the bees, and a page that was left open asks it the moment
    // KweenB is back
    initSocketIo();

    // let a satellite find this KweenB on the network
    if (!this._stopAnnouncing) {
      this._stopAnnouncing = SatelliteSync.announceKweenB();
      app.on("before-quit", () => this._stopAnnouncing?.());
    }
  }

  /**
   * Jack: the one inside KweenB, unless another one was chosen in the
   * settings
   */
  private async initJackFolderPath() {
    const settings = await SettingHelpers.getAllSettings();
    const chosen = settings.kweenBSettings.jackFolderPath;
    useJackFolder(jackFolderFor(chosen && fs.existsSync(chosen) ? chosen : ""));
  }

  /**
   * Earlier versions of KweenB downloaded Jack and JackTrip to the user's
   * data folder at the first start. They are inside KweenB now, so those
   * copies only take up room.
   */
  private removeDownloadedJack() {
    // while developing, the data folder is resources/ itself: there these
    // folders are the ones KweenB runs from
    if (USER_DATA === resourcesPath) return;
    ["jack", "jacktrip"].forEach((folder) => {
      const downloaded = path.join(USER_DATA, folder);
      if (!fs.existsSync(path.join(downloaded, "version.txt"))) return;
      try {
        fs.rmSync(downloaded, { recursive: true, force: true });
      } catch (e) {
        // not in the way when it stays
      }
    });
  }

  /**
   * JackTrip: the one inside KweenB, unless another one was chosen in the
   * settings
   */
  private async initJacktripBinPath() {
    const settings = await SettingHelpers.getAllSettings();
    const chosen = settings.kweenBSettings.jacktripBinPath;
    Zwerm3Jack.default.jacktripBinPath = jacktripBinFor(
      chosen && fs.existsSync(chosen) ? chosen : ""
    );
  }

  /**
   * Logic
   */

  public throwError(error: IError) {
    this._mainWindow.webContents.send("error", error);
  }

  public showInfo(message: string) {
    this._mainWindow.webContents.send("info", message);
  }

  public showSuccess(message: string) {
    this._mainWindow.webContents.send("success", message);
  }

  public setLoader(loading: boolean, text: string = "") {
    this._mainWindow.webContents.send("loading", loading, text);
  }
}

class KweenBGlobal {
  public static kweenb: KweenB;
}

export { KweenB, KweenBGlobal };
