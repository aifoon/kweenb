import { SocketSingleton } from "./lib/socket/SocketSingleton";
import { Socket } from "./lib/socket/Socket";
import { SocketMessageHandler } from "./lib/socket/SocketMessageHandler";

/**
 * Init socket io
 */
export const initSocketIo = () => {
  const socket = new Socket(4444, (message) => {
    SocketMessageHandler.handleMessage(message);
  });
  SocketSingleton.setInstance(socket);
};
