/**
 * All helpers for the kween
 */

import { ITheKween } from "@shared/interfaces";
import ping from "ping";
import { PING_CONFIG } from "../../consts";
import { getAllSettings } from "./SettingHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";

/**
 * Get all information about the kween
 * @returns The Kween settings and online state
 */
const getTheKween = async (): Promise<ITheKween> => {
  // get all the settings
  const settings = await getAllSettings();

  // get the online state of the kween
  const theKweenConnectivity = await ping.promise.probe(
    settings.theKweenSettings.ipAddress,
    PING_CONFIG
  );

  // check if the zwerm3 api is running
  const isApiOn = await Zwerm3ApiHelpers.isZwerm3ApiRunning(
    settings.theKweenSettings.ipAddress
  );

  return {
    isApiOn,
    isOnline: theKweenConnectivity.alive,
    settings: settings.theKweenSettings,
  };
};

export default { getTheKween };
