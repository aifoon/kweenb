import { OscBase } from "./OscBase";

export class PDBeeOsc extends OscBase {
  debug = false;

  async setVolume(value: number): Promise<void> {
    if (this.debug) console.log("/volume", value);
    await this.send(`/volume`, value);
  }

  async setBass(value: number): Promise<void> {
    if (this.debug) console.log("/masterBass", value);
    await this.send(`/masterBass`, value);
  }

  async setMid(value: number): Promise<void> {
    if (this.debug) console.log("/masterMid", value);
    await this.send(`/masterMid`, value);
  }

  async setHigh(value: number): Promise<void> {
    if (this.debug) console.log("/masterHigh", value);
    await this.send(`/masterHigh`, value);
  }

  async setFileLoop(value: boolean): Promise<void> {
    await this.send(`/fileLoop`, value);
  }

  async setUseEq(value: boolean): Promise<void> {
    await this.send(`/useEq`, value);
  }

  async startAudio(value: string): Promise<void> {
    if (this.debug) console.log("/start", value);
    await this.send(`/start`, value);
  }

  async stopAudio(): Promise<void> {
    if (this.debug) console.log("/stop");
    await this.send(`/stop`, 1);
  }
}
