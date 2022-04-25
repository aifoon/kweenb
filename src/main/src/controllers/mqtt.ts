/**
 * The MQTT controllers
 */

import { KweenBGlobal } from "../kweenb";
import { KweenBException } from "../lib/Exceptions/KweenBException";

/**
 * Subscribe to a topic
 * @param event
 * @param topic
 */
export const subscribe = async (
  event: Electron.IpcMainInvokeEvent,
  topic: string
) => {
  try {
    (await KweenBGlobal.getMqtt()).subscribe(topic);
  } catch (e: any) {
    throw new KweenBException(
      { where: "subscribe()", message: e.message },
      true
    );
  }
};

/**
 * Unsubscribe from topic
 * @param event
 * @param topic
 */
export const unsubscribe = async (
  event: Electron.IpcMainInvokeEvent,
  topic: string
) => {
  try {
    (await KweenBGlobal.getMqtt()).unsubscribe(topic);
  } catch (e: any) {
    throw new KweenBException(
      { where: "unsubscribe()", message: e.message },
      true
    );
  }
};
