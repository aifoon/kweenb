/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/**
 * A KweenB instance that will control the requests coming from renderer
 */

import { AppMode } from "@shared/enums";
import { IError } from "@shared/interfaces";
import { BrowserWindow } from "electron";
import { Zwerm3Jack } from "@zwerm3/jack";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";
import SettingHelpers from "./lib/KweenB/SettingHelpers";
import { BeeSshConnections } from "./lib/Dictionaries";
import BeeStatesWorker from "./lib/KweenB/BeeStatesWorker";
import { initPresetsFolder } from "./lib/KweenB/PresetHelpers";

/**
 * A KweenB class
 */
class KweenB {
  private _mainWindow: BrowserWindow;

  private _appMode: AppMode;

  private _beeStatesWorker: BeeStatesWorker;

  private _beeSshConnections: BeeSshConnections;

  constructor(mainWindow: BrowserWindow) {
    this._mainWindow = mainWindow;
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

  public get beeSshConnections() {
    return this._beeSshConnections;
  }

  /**
   * Init KweenB functions
   */

  /**
   * This is an initializer, to init settinges, etc. on boot
   * initJackFolderPath: inits the jackfolder whenever we find one in the database
   * initJacktripBinPath: inits the jacktrip binary whenever we find one in the database
   * initBeeStatesWorker: inits the bee states worker
   */
  public async init() {
    // init the jack folder path
    await this.initJackFolderPath();

    // init the jacktrip binary path
    await this.initJacktripBinPath();

    // init the presets folder path (copy resources to presets folder)
    initPresetsFolder();

    // init the bee states worker
    this._beeStatesWorker = new BeeStatesWorker();
    await this._beeStatesWorker.init();

    // init the bee ssh connections
    this._beeSshConnections = new BeeSshConnections();
  }

  /**
   * Inits the jack folder path
   */
  private async initJackFolderPath() {
    const settings = await SettingHelpers.getAllSettings();
    if (settings.kweenBSettings.jackFolderPath) {
      Zwerm3Jack.default.jackFolderPath =
        settings.kweenBSettings.jackFolderPath;
    }
  }

  /**
   * Inits the jacktrip binary path
   */
  private async initJacktripBinPath() {
    const settings = await SettingHelpers.getAllSettings();
    if (settings.kweenBSettings.jacktripBinPath) {
      Zwerm3Jack.default.jacktripBinPath =
        settings.kweenBSettings.jacktripBinPath;
    }
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
}

class KweenBGlobal {
  public static kweenb: KweenB;

  public static intervalWorkerList: IntervalWorkerList;
}

export { KweenB, KweenBGlobal };
