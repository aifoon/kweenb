/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/**
 * A KweenB instance that will control the requests coming from renderer
 */

import { AppMode } from "@shared/enums";
import { IError } from "@shared/interfaces";
import { BrowserWindow, app } from "electron";
import { Zwerm3Jack } from "@zwerm3/jack";
import SettingHelpers from "./lib/KweenB/SettingHelpers";
import { BeeSshConnections } from "./lib/Dictionaries";
import BeeStatesWorker from "./lib/KweenB/BeeStatesWorker";
import { initPresetsFolder } from "./lib/KweenB/PresetHelpers";
import { resourcesPath } from "@shared/resources";
import fs from "fs";
import {
  JACKTRIP_DOWNLOAD_VERSION,
  JACK_DOWNLOAD_VERSION,
  USER_DATA,
} from "./consts";
import { JacktripInstaller } from "./lib/Installers/JacktripInstaller";
import { exec } from "child_process";
import { JackInstaller } from "./lib/Installers/JackInstaller";
import { PDBeeOsc } from "./lib/OSC";
import { initExpress } from "./express";
import { initSocketIo } from "./socket";

/**
 * A KweenB class
 */
class KweenB {
  private _mainWindow: BrowserWindow;

  private _appMode: AppMode;

  private _beeStatesWorker: BeeStatesWorker;

  private _beeSshConnections: BeeSshConnections;

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

  public get beeSshConnections() {
    return this._beeSshConnections;
  }

  public set mainWindow(mainWindow: BrowserWindow) {
    this._mainWindow = mainWindow;
  }

  /**
   * Check if we have internet
   * @returns boolean if we have internet
   */
  private async hasInternet(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        exec(
          `${resourcesPath}/scripts/is_online_web.sh`,
          (error, onlineStatus, stderr) => {
            resolve(onlineStatus.toString().trim() == "true");
          }
        );
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Init KweenB functions
   */

  /**
   * This is an initializer, to init settinges, etc. on boot, before window is created
   * initJackFolderPath: inits the jackfolder whenever we find one in the database
   * initJacktripBinPath: inits the jacktrip binary whenever we find one in the database
   * initBeeStatesWorker: inits the bee states worker
   */
  public async initBeforeWindow() {
    // init the jack folder path
    await this.initJackFolderPath();

    // init the jacktrip binary path
    await this.initJacktripBinPath();

    // init the presets folder path (copy resources to presets folder)
    initPresetsFolder();

    // init the express server
    initExpress();

    // init Socket IO
    initSocketIo();

    // init the bee ssh connections
    this._beeSshConnections = new BeeSshConnections();
  }

  /**
   * This is an initializer that wil happen after the window is created
   * @param callback A callback function to send messages to the renderer
   */
  public async init(callback: (message: string) => void) {
    // init the bee states worker
    this._beeStatesWorker = new BeeStatesWorker();
    await this._beeStatesWorker.init();

    // send a message to the renderer
    callback("Downloading and installing Jack and JackTrip...");

    // init the jacktrip
    await this.initJackAndJacktrip();
  }

  /**
   * Inits the jack folder path
   */
  private async initJackFolderPath() {
    const settings = await SettingHelpers.getAllSettings();
    Zwerm3Jack.default.jacktripBinPath =
      settings.kweenBSettings.jackFolderPath || `${USER_DATA}/jack/jackd`;
  }

  /**
   * Setup Jack and Jacktrip
   */
  private async initJackAndJacktrip() {
    // check if we need to setup Jack or Jacktrip
    const jacktripPath = `${USER_DATA}/jacktrip`;
    const jacktripAppPath = `${jacktripPath}/JackTrip.app`;
    const jackPath = `${USER_DATA}/jack`;
    const jackdPath = `${jackPath}/jackd`;
    const qjackCtlAppPath = `${jackPath}/QjackCtl.app`;

    if (
      !fs.existsSync(jacktripPath) ||
      !fs.existsSync(jacktripAppPath) ||
      !fs.existsSync(jackPath) ||
      !fs.existsSync(jackdPath) ||
      !fs.existsSync(qjackCtlAppPath)
    ) {
      // check if we have internet
      if (!(await this.hasInternet())) {
        this.showInfo(
          "No internet connection, please connect to the internet and restart kweenb to install Jack and JackTrip."
        );
      } else {
        // download JackTrip if not already present
        if (!fs.existsSync(jacktripAppPath)) {
          await new JacktripInstaller(
            JACKTRIP_DOWNLOAD_VERSION,
            jacktripPath
          ).install();
        }

        // download Jack if not already present
        if (
          !fs.existsSync(jackPath) ||
          !fs.existsSync(jackdPath) ||
          !fs.existsSync(qjackCtlAppPath)
        ) {
          await new JackInstaller(JACK_DOWNLOAD_VERSION, jackPath).install();
        }
      }
    }
  }

  /**
   * Inits the jacktrip binary path
   */
  private async initJacktripBinPath() {
    const settings = await SettingHelpers.getAllSettings();
    Zwerm3Jack.default.jacktripBinPath =
      settings.kweenBSettings.jacktripBinPath ||
      `${USER_DATA}/jacktrip/JackTrip.app/Contents/MacOs/jacktrip`;
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
