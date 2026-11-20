import { Client, Message } from "node-osc";

// one sender per destination, shared by everything that talks to it. A new
// sender for every message would leave a network socket open each time.
const clients = new Map<string, Client>();

const clientFor = (ipAddress: string, port: number): Client => {
  const key = `${ipAddress}:${port}`;
  let client = clients.get(key);
  if (!client) {
    client = new Client(ipAddress, port);
    clients.set(key, client);
  }
  return client;
};

export class OscBase {
  private _oscClient: Client;

  constructor(ipAddress: string, port: number) {
    this._oscClient = clientFor(ipAddress, port);
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
