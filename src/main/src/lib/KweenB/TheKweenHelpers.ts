/**
 * All helpers for the kween
 */

import { IBee, ITheKween } from "@shared/interfaces";
import ping from "ping";
import { PING_CONFIG } from "../../consts";
import SettingHelpers from "./SettingHelpers";
import Zwerm3ApiHelpers from "./Zwerm3ApiHelpers";

/**
 * Get all information about the kween
 * @returns The Kween settings and online state
 */
const getTheKween = async (): Promise<ITheKween> => {
  // get all the settings
  const settings = await SettingHelpers.getAllSettings();

  // get the online state of the kween
  // @deprecated: ping.promise.probe is a deprecated method, but it is still used in the codebase
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

/**
 * Checks if a certain receive channel is available in the hive
 */
const hasReceiveChannel = async (
  receiveChannelName: string
): Promise<boolean> => {
  // get all the settings
  const settings = await SettingHelpers.getAllSettings();

  // get the hubclients
  const hubclients = await Zwerm3ApiHelpers.getHubClients(
    settings.theKweenSettings.ipAddress
  );

  // check if th receive channel is available in the array
  return hubclients.receiveChannels.includes(receiveChannelName);
};

/**
 * Make one audio connection on the hive (the kween)
 * @param source
 * @param destination
 */
const makeAudioConnection = async (source: string, destination: string) => {
  // get all the settings
  const settings = await SettingHelpers.getAllSettings();

  // loop over active bees and make the connection
  await Zwerm3ApiHelpers.connectChannel(
    settings.theKweenSettings.ipAddress,
    source,
    destination
  );
};

/**
 * Make the audio connections in the hive
 */
const makeHubAudioConnections = async (activeBees: IBee[]) => {
  // get all the settings
  const settings = await SettingHelpers.getAllSettings();

  // loop over active bees and make the connection
  activeBees.forEach(async ({ id, name }) => {
    await Zwerm3ApiHelpers.connectChannel(
      settings.theKweenSettings.ipAddress,
      `kweenb:receive_${id}`,
      `${name}:send_1`
    );
  });
};

/**
 * Validate if the hub server contains all active bees senders and kweenb receivers
 */
const validateHive = async (activeBees: IBee[]): Promise<boolean> => {
  // get all the settings
  const settings = await SettingHelpers.getAllSettings();

  // get the hubclients
  const hubclients = await Zwerm3ApiHelpers.getHubClients(
    settings.theKweenSettings.ipAddress
  );

  // validate the kweenb receive channels
  for (
    let i = 1;
    i <= settings.kweenBAudioSettings.jacktrip.receiveChannels;
    i += 1
  ) {
    if (!hubclients.receiveChannels.includes(`kweenb:receive_${i}`))
      return false;
  }

  // validate the active bee send channels
  // eslint-disable-next-line no-restricted-syntax
  for (const bee of activeBees) {
    if (!hubclients.sendChannels.includes(`${bee.name}:send_1`)) return false;
  }

  // get the hub clients on the kween
  return true;
};

export default {
  getTheKween,
  hasReceiveChannel,
  makeAudioConnection,
  makeHubAudioConnections,
  validateHive,
};
