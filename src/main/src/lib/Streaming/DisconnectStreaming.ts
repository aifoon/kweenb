import Streaming from "./Streaming";

export default class DisconnectStreaming extends Streaming {
  /**
   * Connect streaming procedure in HUB mode
   */
  public async handleConnect(): Promise<void> {
    try {
      /**
       * Step 1: Generic pre-connection check (this one is actually also in use for disconnecting)
       */

      await this.preConnectionCheck();

      /**
       * Exit the process by sending success
       */
      this.sendSuccess();
    } catch (e: any) {
      this.sendError(e.message);
    }
  }
}
