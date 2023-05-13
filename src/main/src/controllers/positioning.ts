/**
 * The controller used for positioning
 */

import { IpcMainEvent, IpcMainInvokeEvent } from "electron";
import { PozyxMqttBroker } from "../lib/Positioning/PozyxMqttBroker";
import { PozyxData } from "../lib/Positioning/PozyxData";
import { PositioningControllerAlgorithm, PositioningTargetType } from "@shared/interfaces";
import PositioningControllerSingleton from "../lib/Positioning/PositioningControllerSingleton";

/**
 * Connect with Pozyx MQTT Broker
 * @param event
 * @param pozyxMqttBrokerUrl
 * @returns
 */
export const connectPozyxMqttBroker = async (event: IpcMainInvokeEvent, pozyxMqttBrokerUrl: string): Promise<boolean> => {
  return await PozyxMqttBroker.connectToPozyxMqttBroker(pozyxMqttBrokerUrl);
};

/**
 * Disconnect from Pozyx MQTT Broker
 * @param event
 * @param pozyxMqttBrokerUrl
 */
export const disconnectPozyxMqttBroker = (event: IpcMainEvent, pozyxMqttBrokerUrl: string) => {
  PozyxMqttBroker.disconnectPozyxMqttBroker(pozyxMqttBrokerUrl);
};

/**
 * Get all the tags, we find in the PozyxData memory
 * @param event
 * @returns
 */
export const getAllTagIds = (event: IpcMainInvokeEvent) => {
  return Array.from(PozyxData.getAllPozyxData().keys());
}

/**
 * Enable/Diable the positioning controller algorithm
 * @param event The event
 * @param algorithm The algorithm to enable/disable
 * @param enable True to enable, false to disable
 */
export const enablePositioningControllerAlgorithm = (event: IpcMainEvent, algorithm: PositioningControllerAlgorithm, enable: boolean) => {
  PositioningControllerSingleton.getInstance().enablePositioningControllerAlgorithm(algorithm, enable);
}

/**
 * Enable/Diable the positioning controller algorithm
 * @param event The event
 * @param algorithm The algorithm to enable/disable
 * @param enable True to enable, false to disable
 */
export const enablePositioningControllerTargetType = (event: IpcMainEvent, targetType: PositioningTargetType, enable: boolean) => {
  PositioningControllerSingleton.getInstance().enableTargetType(targetType, enable);
}

/**
 * Sets the options for the positioning controller algorithm
 * @param event The event
 * @param algorithm The algorithm to set the options for
 * @param options The options to set
 */
export const setPositioningControllerAlgorithmOptions = (event: IpcMainEvent, algorithm: PositioningControllerAlgorithm, options: any) => {
  PositioningControllerSingleton.getInstance().setOptions(algorithm, options);
}
