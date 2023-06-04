import { OscBase } from "./OscBase";

export class ReaperOsc extends OscBase {
  async setTrackVolume(trackId: number, volume: number): Promise<void> {
    await this.send(`/track/${trackId}/volume`, volume);
  }
}
