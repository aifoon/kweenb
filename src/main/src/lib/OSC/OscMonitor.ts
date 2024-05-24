import { OscBase } from "./OscBase";

export class OscMonitor extends OscBase {
  async sendDebugMessage(address: string, value: any): Promise<void> {
    await this.send(address, String(value));
  }
}
