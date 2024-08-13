import { socket } from "../socket";
import { SocketMessage } from "@shared/interfaces";

export const useSocket = () => {
  /**
   * Connect to the socket server
   */
  const connect = () => {
    // connect to socket
    socket.connect();
  };

  /**
   * Disconnect from the socket server
   */
  const disconnect = () => {
    socket.disconnect();
  };

  /**
   * Send data to the socket server
   * @param payload
   */
  const sendToServerWithoutResponse = (message: string, json?: Object) => {
    const socketMessage: SocketMessage = {
      message,
    };
    if (json) {
      socketMessage.payload = JSON.stringify(json);
    }

    // send the message
    socket.send(socketMessage);
  };

  /**
   * Send data to the server asynchronously
   * @param message
   * @param json
   * @returns
   */
  const sendToServerAndExpectResponseAsync = async (
    message: string,
    json?: Object
  ) => {
    return new Promise((resolve) => {
      const socketMessage: SocketMessage = {
        message,
      };
      if (json) {
        socketMessage.payload = JSON.stringify(json);
      }

      // send the message
      socket.send(socketMessage);

      // call the callback if it exists
      socket.once(message, (data) => {
        resolve(data);
      });
    });
  };

  return {
    connect,
    disconnect,
    sendToServerWithoutResponse,
    sendToServerAndExpectResponseAsync,
  };
};
