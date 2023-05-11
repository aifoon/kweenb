/**
 * The controller used for positioning
 */

import { IpcMainEvent } from "electron";
import { PozyxMqttBroker } from "../lib/Positioning/PozyxMqttBroker";

export const connectPozyxMqttBroker = async (event: Electron.IpcMainInvokeEvent, pozyxMqttBrokerUrl: string): Promise<boolean> => {
  return await PozyxMqttBroker.connectToPozyxMqttBroker(pozyxMqttBrokerUrl);
};

export const disconnectPozyxMqttBroker = (event: IpcMainEvent, pozyxMqttBrokerUrl: string) => {
  PozyxMqttBroker.disconnectPozyxMqttBroker(pozyxMqttBrokerUrl);
};
