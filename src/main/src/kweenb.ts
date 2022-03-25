/* eslint-disable max-classes-per-file */
/**
 * A KweenB instance that will control the requests coming from renderer
 */

import { IError } from "@shared/interfaces";
import { BrowserWindow } from "electron";
import IntervalWorkerList from "./lib/Interval/IntervalWorkerList";

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
}

export { KweenB, KweenBGlobal };
