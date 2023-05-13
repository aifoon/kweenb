import { OscBase } from "./OscBase";

export class ReaperOsc extends OscBase {
  constructor(ipAddress: string, port: number) {
    super(ipAddress, port);
  }

  async setTrackVolume(trackId: number, volume: number): Promise<void> {
    return this.send(`/track/${trackId}/volume`, volume);
  }
}