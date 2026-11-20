import { SocketMessage } from "@shared/interfaces";
import { Server } from "socket.io";

export class Socket {
  private port: number;

  public socketServer: Server;

  private _onMessage: ((message: SocketMessage) => void) | undefined;

  constructor(port: number, onMessage?: (message: SocketMessage) => void) {
    this.port = port;
    this._onMessage = onMessage;
    this.initServer();
  }

  /**
   * Init the server
   */
  private initServer() {
    try {
      this.socketServer = new Server(this.port, {
        cors: {
          origin: `*`,
        },
        // a phone that lost its connection is noticed within about ten
        // seconds (the default is 45), and so is KweenB by the phone
        pingInterval: 5000,
        pingTimeout: 5000,
      });
      this.socketServer.on("connect", (socket) => {
        socket.on("message", (data: any) => {
          if (this._onMessage)
            this._onMessage({ ...data, clientId: socket.id } as SocketMessage);
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Send data to a specific client
   * @param clientId
   * @param event
   * @param data
   */
  public sendToClient(clientId: string, event: string, data: any) {
    this.socketServer.to(clientId).emit(event, data);
  }
}
