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
import { MQTT } from "./lib/Mqtt";

/**
 * A KweenB class
 */
class KweenB {
  private _mainWindow: BrowserWindow;

  private _appMode: AppMode;

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

  /**
   * Init KweenB functions
   */

  /**
   * This is an initializer, to init settinges, etc. on boot
   * initJackFolderPath: inits the jackfolder whenever we find one in the database
   * initJacktripBinPath: inits the jacktrip binary whenever we find one in the database
   */
  public async init() {
    this.initJackFolderPath();
    this.initJacktripBinPath();
  }

  private async initJackFolderPath() {
    const settings = await SettingHelpers.getAllSettings();
    if (settings.kweenBSettings.jackFolderPath) {
      Zwerm3Jack.default.jackFolderPath =
        settings.kweenBSettings.jackFolderPath;
    }
  }

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

  private static mqtt: MQTT;

  public static async getMqtt(): Promise<MQTT> {
    // get all the internal settings
    const settings = await SettingHelpers.getAllSettings();

    // if we have an MQTT instance singleton, return this one to avoid
    // multiple instances
    if (KweenBGlobal.mqtt) {
      // check if the mqttbroker from the settings is the same, otherwise create a new instance
      // @TODO - there is still a bug, when changing the mqtt broker we need to restart the application
      if (
        settings.kweenBSettings.mqttBroker ===
        `mqtt://${(await KweenBGlobal.mqtt.getMQTTClient()).options.host}`
      )
        return KweenBGlobal.mqtt;
    }
    // create a new MQTT broker instance
    KweenBGlobal.mqtt = new MQTT(
      settings.kweenBSettings.mqttBroker,
      (t, message) => {
        KweenBGlobal.kweenb.mainWindow.webContents.send(
          "mqtt-message",
          t,
          message.toString()
        );
      }
    );

    // return the new instance
    return KweenBGlobal.getMqtt();
  }
}

export { KweenB, KweenBGlobal };
