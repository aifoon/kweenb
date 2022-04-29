import { ITheKween } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import theKweenHelpers from "../lib/KweenB/TheKweenHelpers";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import Zwerm3ApiHelpers from "../lib/KweenB/Zwerm3ApiHelpers";

/**
 * Fetching the kween
 * @returns an object shaped like an ITheKween
 */
export const fetchTheKween = async (): Promise<ITheKween> => {
  try {
    return await theKweenHelpers.getTheKween();
  } catch (e: any) {
    throw new KweenBException(
      { where: "fetchTheKween()", message: e.message },
      true
    );
  }
};

/**
 * Check if zwerm3API is running on The Kween
 * @returns
 */
export const isZwerm3ApiRunningOnTheKween = async () => {
  try {
    const settings = await SettingHelpers.getAllSettings();
    return await Zwerm3ApiHelpers.isZwerm3ApiRunning(
      settings.theKweenSettings.ipAddress
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "isZwerm3ApiRunningOnTheKween()", message: e.message },
      true
    );
  }
};

/**
 * Fetching the kween
 * @returns an object shaped like an ITheKween
 */
export const killJackAndJacktrip = async () => {
  try {
    const settings = await SettingHelpers.getAllSettings();
    await Zwerm3ApiHelpers.killJackAndJacktrip(
      settings.theKweenSettings.ipAddress
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJackAndJacktrip()", message: e.message },
      true
    );
  }
};
