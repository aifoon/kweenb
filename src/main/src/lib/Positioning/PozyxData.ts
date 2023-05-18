import { IPozyxData } from "@shared/interfaces";
import Dictionary from "../Dictionary";

export class PozyxData {
  private static _pozyxData: Dictionary<IPozyxData> =
    new Dictionary<IPozyxData>();

  private static _onNewPozyxData: (pozyxData: IPozyxData) => void;

  public static set onNewPozyxData(callback: (pozyxData: IPozyxData) => void) {
    this._onNewPozyxData = callback;
  }

  public static setPozyxData(pozyxData: IPozyxData) {
    this._pozyxData.setValue(pozyxData.tagId, pozyxData);
    this._onNewPozyxData?.(pozyxData);
  }

  public static getAllPozyxData() {
    return this._pozyxData.getMemory();
  }

  public static getTagData(tagId: string) {
    return this._pozyxData.getValue(tagId);
  }
}
