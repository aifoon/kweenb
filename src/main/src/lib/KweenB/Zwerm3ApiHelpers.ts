/**
 * The Zwerm3API Helpers
 */

import fetch from "node-fetch";
import { ZWERM3API_PORT } from "../../consts";
import { FETCH_ERROR, POST_ERROR } from "../Exceptions/ExceptionMessages";
import { getAllSettings } from "./SettingHelpers";

interface ApiResponse {
  message: string;
}

interface ApiBooleanResponse extends ApiResponse {
  status: boolean;
}

/**
 * Check if Zwerm3API is running
 * @param ipAddress
 * @returns
 */
const isZwerm3ApiRunning = async (ipAddress: string) => {
  try {
    const endpoint = `http://${ipAddress}:${ZWERM3API_PORT}/jackpaths`;
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

  // fetch the status of the endpoint
  const endpoint = `http://${ipAddress}:${ZWERM3API_PORT}/jack/isrunning`;
  const response = await fetch(endpoint);
  if (response.status === 500) throw new Error(FETCH_ERROR("isJackRunning"));
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

  const endpoint = `http://${ipAddress}:${ZWERM3API_PORT}/jacktrip/isrunning`;
  const response = await fetch(endpoint);
  if (response.status === 500)
    throw new Error(FETCH_ERROR("isJacktripRunning"));
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
  if (!(await isZwerm3ApiRunning(ipAddress))) return;

  const endpoint = `http://${ipAddress}:${ZWERM3API_PORT}/killalljack`;
  const response = await fetch(endpoint);
  if (response.status === 500)
    throw new Error(FETCH_ERROR("killJackAndJacktrip"));
};

/**
 * Start the Jack process
 * @param ipAddress
 * @returns
 */
const startJack = async (ipAddress: string) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress))) return;

  // get the settings
  const settings = await getAllSettings();

  // create the post body
  const body = {
    device: "",
    channel: settings.beeAudioSettings.channels,
    bufferSize: settings.beeAudioSettings.jack.bufferSize,
    sampleRate: settings.beeAudioSettings.jack.sampleRate,
  };

  // do the post
  const endpoint = `http://${ipAddress}:${ZWERM3API_PORT}/jack/start`;
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
};
