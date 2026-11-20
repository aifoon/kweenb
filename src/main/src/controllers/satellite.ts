/**
 * The satellite: the Raspberry Pi with the trigger interface for walks
 */

import { ISatellite, ISendToSatelliteAnswer } from "@shared/interfaces";
import SatelliteSync from "../lib/Satellite/SatelliteSync";

/**
 * Look for the satellites on the network
 */
export const findSatellites = async (): Promise<ISatellite[]> => {
  try {
    return await SatelliteSync.findSatellites();
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * Bring KweenB and a satellite in line: what was made on the satellite comes
 * to KweenB, then everything of KweenB goes to the satellite
 */
export const sendToSatellite = async (
  event: Electron.IpcMainInvokeEvent,
  satellite: ISatellite
): Promise<ISendToSatelliteAnswer> => {
  try {
    const result = await SatelliteSync.syncWithSatellite(
      String(satellite?.host),
      Number(satellite?.port)
    );
    return { success: true, result };
  } catch (e: any) {
    console.error(e);
    return {
      success: false,
      message: e?.message || "Sending to the satellite failed. Try again.",
    };
  }
};
