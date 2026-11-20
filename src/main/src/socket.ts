import { SocketSingleton } from "./lib/socket/SocketSingleton";
import { Socket } from "./lib/socket/Socket";
import { SocketMessageHandler } from "./lib/socket/SocketMessageHandler";
import { SOCKET_PORT } from "./consts";

/**
 * Init socket io
 */
// the window can load more than once, the server starts only once
let started = false;

export const initSocketIo = () => {
  if (started) return;
  started = true;
  const socket = new Socket(SOCKET_PORT, (message) => {
    SocketMessageHandler.handleMessage(message);
  });
  SocketSingleton.setInstance(socket);
};
