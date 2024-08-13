import { SocketMessage } from "@shared/interfaces";
import { Server } from "socket.io";

export class Socket {
  private port: number;

  public socketServer: Server;

  private _onMessage: ((message: SocketMessage) => void) | undefined;

  private debug: boolean = false;

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
      });
      this.socketServer.on("connect", (socket) => {
        if (this.debug) console.log(socket.id);
        socket.on("message", (data: any) => {
          if (this._onMessage)
            this._onMessage({ ...data, clientId: socket.id } as SocketMessage);
        });
      });
    } catch (error) {
      if (this.debug) console.error(error);
    }
  }

  /**
   * Send data to the clients
   * @param event The event to send
   * @param data The data to send
   */
  public sendToClients(event: string, data: any) {
    this.socketServer.emit(event, data);
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
