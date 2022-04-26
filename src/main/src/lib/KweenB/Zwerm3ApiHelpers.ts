/**
 * The Zwerm3API Helpers
 */

import { IBeeConfig, ISetting } from "@shared/interfaces";
import fetch from "node-fetch";
import { DEFAULT_BEE_CONFIG, ZWERM3API_PORT } from "../../consts";
import {
  FETCH_ERROR,
  POST_ERROR,
  ZWERM3_API_NOTRUNNING,
} from "../Exceptions/ExceptionMessages";
import SettingHelpers from "./SettingHelpers";

interface ApiResponse {
  message: string;
}

interface ApiBooleanResponse extends ApiResponse {
  status: boolean;
}

/**
 * Create the full endpoint, based on the ipAddress and endpoint
 * @param ipAddress
 * @param endpoint
 * @returns
 */
const createFullEndpoint = (ipAddress: string, endpoint: string): string =>
  `http://${ipAddress}:${ZWERM3API_PORT}/${endpoint}`;

/**
 * Check if Zwerm3API is running
 * @param ipAddress
 * @returns
 */
const isZwerm3ApiRunning = async (ipAddress: string) => {
  try {
    const endpoint = createFullEndpoint(ipAddress, "jackPaths");

    // with this trick, we can abort the fetch after one second
    const controller = new AbortController();

    // set the timeout
    const id = setTimeout(() => controller.abort(), 1000);

    // do the fetch
    await fetch(endpoint, {
      signal: controller.signal,
    });

    // clears the timeout that is running
    clearTimeout(id);
    return true;
  } catch (e: any) {
    return false;
  }
};

/**
 * Check if isJackRunning on the client
 * @param ipAddress
 * @returns
 */
const isJackRunning = async (ipAddress: string): Promise<boolean> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress))) return false;

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jack/isrunning");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (response.status === 500) throw new Error(FETCH_ERROR("isJackRunning"));

  // return the response if valid
  const responseJson = (await response.json()) as ApiBooleanResponse;
  return responseJson.status;
};

/**
 * Check if isJacktripRunning on the client
 * @param ipAddress
 * @returns
 */
const isJacktripRunning = async (ipAddress: string): Promise<boolean> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress))) return false;

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jacktrip/isrunning");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (response.status === 500)
    throw new Error(FETCH_ERROR("isJacktripRunning"));

  // return the response if valid
  const responseJson = (await response.json()) as ApiBooleanResponse;
  return responseJson.status;
};

/**
 * Gets all the configuration coming from the zwerm3 API
 * @param ipAddress
 */
const getAllConfig = async (ipAddress: string): Promise<IBeeConfig> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress))) return DEFAULT_BEE_CONFIG;

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "config/all");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (!response || response.status === 500)
    throw new Error(FETCH_ERROR("getAllConfig"));

  // convert to json
  const config = (await response.json()) as ISetting[];

  // create an inner function to find a setting easy
  const findKey = (key: string) => config.find((c) => c.key === key);

  // create the bee configuration
  const beeConfig = {
    jacktripVersion: findKey("jacktrip_version")?.value || "1.5.3",
    useMqtt: (findKey("use_mqtt")?.value || 0) === "true",
    mqttBroker: findKey("mqtt_broker")?.value || "mqtt://localhost:1883",
    mqttChannel: findKey("mqtt_channel")?.value || "beeworker",
  };

  // return the bee configuration
  return beeConfig;
};

/**
 * Kills all the jack and jacktrip processes on client
 * @param ipAddress
 * @returns
 */
const killJackAndJacktrip = async (ipAddress: string) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "killalljack");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (response.status === 500)
    throw new Error(FETCH_ERROR("killJackAndJacktrip"));
};

/**
 * Kills all the jack processes on client
 * @param ipAddress
 * @returns
 */
const killJack = async (ipAddress: string) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jack/kill");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (response.status === 500) throw new Error(FETCH_ERROR("killJack"));
};

/**
 * Kills all the jacktrip processes on client
 * @param ipAddress
 * @returns
 */
const killJacktrip = async (ipAddress: string) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jacktrip/kill");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (response.status === 500) throw new Error(FETCH_ERROR("killJacktrip"));
};

/**
 * Start the Jack process
 * @param ipAddress
 * @returns
 */
const startJack = async (ipAddress: string) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const body = {
    device: settings.beeAudioSettings.jack.device,
    channel: settings.beeAudioSettings.channels,
    bufferSize: settings.beeAudioSettings.jack.bufferSize,
    sampleRate: settings.beeAudioSettings.jack.sampleRate,
    periods: settings.beeAudioSettings.jack.periods,
  };

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jack/start");

  // fetch the response
  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  // if we have an internal error
  if (response.status === 500) {
    throw new Error(POST_ERROR("startJack"));
  }
};

/**
 * Save the configuration in the api behind the given ip address
 * @param ipAddress ipAddress
 * @param setting setting
 */
const saveConfig = async (ipAddress: string, config: Partial<IBeeConfig>) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "config/save");

  // convert the camel casing to snake casing
  const camelToSnakeCase = (str: string) =>
    str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

  // get the properties from the object
  const configProperties = Object.keys(config);

  // loop over the properties
  configProperties.forEach(async (configProperty) => {
    const configSetting: ISetting = {
      key: camelToSnakeCase(configProperty),
      value: config[configProperty as keyof IBeeConfig]?.toString() || "",
    };

    // fetch the response
    const response = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify(configSetting),
      headers: { "Content-Type": "application/json" },
    });

    // if we have an internal error
    if (response.status === 500) {
      throw new Error(POST_ERROR("saveConfig"));
    }
  });
};

export default {
  getAllConfig,
  isJackRunning,
  isJacktripRunning,
  isZwerm3ApiRunning,
  killJack,
  killJackAndJacktrip,
  killJacktrip,
  saveConfig,
  startJack,
};
