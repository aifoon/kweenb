import { OscBase } from "./OscBase";

export class PDBeeOsc extends OscBase {
  async setVolume(value: number): Promise<void> {
    await this.send(`/volume`, value);
  }

  async setBass(value: number): Promise<void> {
    await this.send(`/masterBass`, value);
  }

  async setMid(value: number): Promise<void> {
    await this.send(`/masterMid`, value);
  }

  async setHigh(value: number): Promise<void> {
    await this.send(`/masterHigh`, value);
  }

  async setFileLoop(value: boolean): Promise<void> {
    await this.send(`/fileLoop`, value);
  }

  async setUseEq(value: boolean): Promise<void> {
    await this.send(`/useEq`, value);
  }

  async startAudio(value: string): Promise<void> {
    await this.send(`/start`, value);
  }

  async stopAudio(): Promise<void> {
    await this.send(`/stop`, 1);
  }
}
