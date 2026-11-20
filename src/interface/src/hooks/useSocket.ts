import { SocketMessage } from "@shared/interfaces";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

// KweenB listens on the computer this page was opened from
const SOCKET_PORT = 4444;

// how long an answer of KweenB may take
const ANSWER_TIMEOUT_MS = 8000;

/**
 * Whether this page is connected with KweenB right now
 */
export const useConnection = create<{ connected: boolean }>(() => ({
  connected: false,
}));

// one connection for the whole page
let socket: Socket | null = null;

const theSocket = (): Socket => {
  if (!socket) {
    socket = io(
      `${window.location.protocol}//${window.location.hostname}:${SOCKET_PORT}`,
      { reconnectionDelay: 1000, reconnectionDelayMax: 5000 }
    );
    socket.on("connect", () => useConnection.setState({ connected: true }));
    socket.on("disconnect", () => useConnection.setState({ connected: false }));
  }
  return socket;
};

const messageOf = (message: string, json?: Object): SocketMessage =>
  json ? { message, payload: JSON.stringify(json) } : { message };

/**
 * Tell KweenB something. Without a connection nothing is sent: a start or
 * stop that arrives later, when the connection is back, would surprise.
 */
const sendToServerWithoutResponse = (message: string, json?: Object) => {
  const connection = theSocket();
  if (!connection.connected) return;
  connection.send(messageOf(message, json));
};

// KweenB answers with the name of the question, so two questions of the same
// kind wait for each other: else one could get the answer of the other
const lastQuestion = new Map<string, Promise<unknown>>();

/**
 * Ask KweenB something and wait for the answer
 */
const sendToServerAndExpectResponseAsync = (
  message: string,
  json?: Object
): Promise<unknown> => {
  const previous = lastQuestion.get(message) || Promise.resolve();
  const question = previous
    .catch(() => undefined)
    .then(
      () =>
        new Promise<unknown>((resolve, reject) => {
          const connection = theSocket();
          if (!connection.connected) {
            reject(new Error("Not connected with KweenB."));
            return;
          }
          const onAnswer = (data: unknown) => {
            clearTimeout(timer);
            resolve(data);
          };
          const timer = setTimeout(() => {
            connection.off(message, onAnswer);
            reject(new Error("KweenB did not answer in time."));
          }, ANSWER_TIMEOUT_MS);
          connection.once(message, onAnswer);
          connection.send(messageOf(message, json));
        })
    );
  lastQuestion.set(message, question);
  return question;
};

export const useSocket = () => ({
  connect: () => {
    theSocket();
  },
  sendToServerWithoutResponse,
  sendToServerAndExpectResponseAsync,
});
