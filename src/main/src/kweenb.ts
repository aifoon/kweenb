/* eslint-disable max-classes-per-file */
/**
 * A KweenB instance that will control the requests coming from renderer
 */

import { IError } from "@shared/interfaces";
import { BrowserWindow } from "electron";
import * as mqtt from "mqtt";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";
import SettingHelpers from "./lib/KweenB/SettingHelpers";
import { MQTT } from "./lib/Mqtt";

/**
 * A KweenB class
 */
class KweenB {
  private _mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this._mainWindow = mainWindow;
  }

  /**
   * Getters & Setters
   */

  public get mainWindow() {
    return this._mainWindow;
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
