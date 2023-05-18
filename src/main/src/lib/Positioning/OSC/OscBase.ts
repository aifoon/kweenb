import { Client, Message } from "node-osc";

export class OscBase {
  private _oscClient;

  public get oscClient() {
    return this._oscClient;
  }

  constructor(ipAddress: string, port: number) {
    this._oscClient = new Client(ipAddress, port);
  }

  async send(address: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this._oscClient.send(new Message(address, value), (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
