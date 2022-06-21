import { ITheKween } from "@shared/interfaces";
import { BeeActiveState } from "@shared/enums";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import theKweenHelpers from "../lib/KweenB/TheKweenHelpers";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import Zwerm3ApiHelpers from "../lib/KweenB/Zwerm3ApiHelpers";
import BeeHelpers from "../lib/KweenB/BeeHelpers";

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

/**
 * Make all audio connections
 */
export const makeHubAudioConnections = async () => {
  try {
    const activeBees = await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
    await theKweenHelpers.makeHubAudioConnections(activeBees);
  } catch (e: any) {
    throw new KweenBException(
      { where: "makeHubAudioConnections()", message: e.message },
      true
    );
  }
};

/**
 * Fetching the kween
 * @returns an object shaped like an ITheKween
 */
export const startHubServer = async () => {
  try {
    const thekween = await theKweenHelpers.getTheKween();
    await Zwerm3ApiHelpers.startJackWithJacktripHubServer(
      thekween.settings.ipAddress
    );
  } catch (e: any) {
    throw new KweenBException(
      { where: "startHubServer()", message: e.message },
      true
    );
  }
};

/**
 * Validate the hive
 * @returns boolean if the hive is ready for connections
 */
export const validateHive = async (): Promise<boolean> => {
  try {
    const activeBees = await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
    return await theKweenHelpers.validateHive(activeBees);
  } catch (e: any) {
    throw new KweenBException(
      { where: "validateHive()", message: e.message },
      true
    );
  }
};
