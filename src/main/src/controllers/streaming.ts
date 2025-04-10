import { StreamingConnectionStatus } from "@shared/interfaces";
import {
  DisconnectStreaming,
  HubStreaming,
  P2PStreaming,
  TriggerOnlyStreaming,
} from "../lib/Streaming";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import { KweenBGlobal } from "../kweenb";

/**
 * Start disconnecting streaming
 */
export const startDisconnectStreaming = () => {
  try {
    const onLoggingEvent = (
      streamConnectionStatus: StreamingConnectionStatus
    ) => {
      KweenBGlobal.kweenb.mainWindow.webContents.send(
        "streaming-connection-status",
        streamConnectionStatus
      );
    };
    new DisconnectStreaming(onLoggingEvent).handleConnect();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startDisconnectStreaming()", message: e.message },
      false
    );
  }
};

/**
 * Start streaming in HUB mode
 */
export const startHubStreaming = () => {
  try {
    const onLoggingEvent = (
      streamConnectionStatus: StreamingConnectionStatus
    ) => {
      KweenBGlobal.kweenb.mainWindow.webContents.send(
        "streaming-connection-status",
        streamConnectionStatus
      );
    };
    new HubStreaming(onLoggingEvent).handleConnect();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startHubStreaming()", message: e.message },
      false
    );
  }
};

/**
 * Start streaming in P2P mode
 */
export const startP2PStreaming = () => {
  try {
    const onLoggingEvent = (
      streamConnectionStatus: StreamingConnectionStatus
    ) => {
      KweenBGlobal.kweenb.mainWindow.webContents.send(
        "streaming-connection-status",
        streamConnectionStatus
      );
    };
    new P2PStreaming(onLoggingEvent).handleConnect();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startHubStreaming()", message: e.message },
      false
    );
  }
};

/**
 * Start disconnecting streaming
 */
export const startTriggerOnlyStreaming = () => {
  try {
    const onLoggingEvent = (
      streamConnectionStatus: StreamingConnectionStatus
    ) => {
      KweenBGlobal.kweenb.mainWindow.webContents.send(
        "streaming-connection-status",
        streamConnectionStatus
      );
    };
    new TriggerOnlyStreaming(onLoggingEvent).handleConnect();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startDisconnectStreaming()", message: e.message },
      false
    );
  }
};
