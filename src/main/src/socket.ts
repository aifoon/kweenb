import { SocketSingleton } from "./lib/socket/SocketSingleton";
import { Socket } from "./lib/socket/Socket";
import { SocketMessageHandler } from "./lib/socket/SocketMessageHandler";
import { SOCKET_PORT } from "./consts";

/**
 * Init socket io
 */
export const initSocketIo = () => {
  const socket = new Socket(SOCKET_PORT, (message) => {
    SocketMessageHandler.handleMessage(message);
  });
  SocketSingleton.setInstance(socket);
};
