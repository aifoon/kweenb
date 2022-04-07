/**
 * The Zwerm3API Helpers
 */

import fetch from "node-fetch";
import { ZWERM3API_PORT } from "../../consts";
import {
  FETCH_ERROR,
  POST_ERROR,
  ZWERM3_API_NOTRUNNING,
} from "../Exceptions/ExceptionMessages";
import { getAllSettings } from "./SettingHelpers";

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
    await fetch(endpoint);
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
  console.log(endpoint);
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
  const settings = await getAllSettings();

  // create the post body
  const body = {
    device: settings.beeAudioSettings.jack.device,
    channel: settings.beeAudioSettings.channels,
    bufferSize: settings.beeAudioSettings.jack.bufferSize,
    sampleRate: settings.beeAudioSettings.jack.sampleRate,
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

export default {
  isJackRunning,
  isJacktripRunning,
  startJack,
  isZwerm3ApiRunning,
  killJackAndJacktrip,
  killJack,
  killJacktrip,
};
