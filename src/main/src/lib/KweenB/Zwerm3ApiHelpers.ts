/**
 * The Zwerm3API Helpers
 */

import {
  IBeeConfig,
  IHubClients,
  IHubClientsResponse,
  IHubServerInfo,
  ISetting,
  ISystemClients,
  ISystemClientsResponse,
} from "@shared/interfaces";
import fetch from "node-fetch";
import {
  DEFAULT_BEE_CONFIG,
  START_PORT_JACKTRIP_HUB_SERVER,
  ZWERM3API_PORT,
} from "../../consts";
import {
  FETCH_ERROR,
  POST_ERROR,
  ZWERM3_API_NOTRUNNING,
} from "../Exceptions/ExceptionMessages";
import SettingHelpers from "./SettingHelpers";
import BeeSsh from "./BeeSsh";
import ip from "ip";

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
    return await BeeSsh.isZwerm3ApiRunning(ipAddress);
  } catch (e: any) {
    return false;
  }
};

/**
 * Connect channels
 * @param ipAddress
 * @returns
 */
const connectChannel = async (
  ipAddress: string,
  source: string,
  destination: string
) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress))) return;

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jack/connectChannel");

  // do a post to connect the channels
  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify({
      source,
      destination,
    }),
    headers: { "Content-Type": "application/json" },
  });

  // if we have an internal error
  if (response.status === 500) {
    throw new Error(POST_ERROR("connectChannel"));
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
    device: findKey("device")?.value || "",
  };

  // return the bee configuration
  return beeConfig;
};

/**
 * Get all connected hubclients
 * @param ipAddress
 * @returns
 */
const getHubClients = async (ipAddress: string): Promise<IHubClients> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    return { sendChannels: [], receiveChannels: [] };

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jack/hubclients");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (!response || response.status === 500)
    throw new Error(FETCH_ERROR("getHubClients"));

  // convert to json
  const hubClientsResponse = (await response.json()) as IHubClientsResponse;

  // return the hubclients
  return hubClientsResponse.hubClients;
};

/**
 * Get the local jack system clients
 * @param ipAddress
 * @returns
 */
const getJackSystemClients = async (
  ipAddress: string
): Promise<ISystemClients> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    return { playbackChannels: [], captureChannels: [] };

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "jack/systemclients");

  // fetch the response
  const response = await fetch(endpoint);

  // validate the response
  if (!response || response.status === 500)
    throw new Error(FETCH_ERROR("getJackSystemClients"));

  // convert to json
  const jackSystemClientsResponse =
    (await response.json()) as ISystemClientsResponse;

  // return the hubclients
  return jackSystemClientsResponse.systemClients;
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
const startJack = async (ipAddress: string, triggerOnly: boolean = false) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const body = {
    device: settings.beeAudioSettings.jack.device,
    inputChannels: settings.beeAudioSettings.jack.inputChannels,
    outputChannels: settings.beeAudioSettings.jack.outputChannels,
    bufferSize: triggerOnly ? 128 : settings.beeAudioSettings.jack.bufferSize,
    sampleRate: settings.beeAudioSettings.jack.sampleRate,
    periods: triggerOnly ? 24 : settings.beeAudioSettings.jack.periods,
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
 * Start Jack With Jacktrip Hub Server
 * @param ipAddress The ip address where the zwerm3api is running
 */
const startJackWithJacktripHubServer = async (ipAddress: string) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const body = {
    jack: {
      device: settings.beeAudioSettings.jack.device,
      inputChannels: settings.beeAudioSettings.jack.inputChannels,
      outputChannels: settings.beeAudioSettings.jack.outputChannels,
      bufferSize: settings.beeAudioSettings.jack.bufferSize,
      sampleRate: settings.beeAudioSettings.jack.sampleRate,
      periods: settings.beeAudioSettings.jack.periods,
    },
    killAllProcessesBeforeStart: true,
    jacktrip: {
      channels: settings.beeAudioSettings.jacktrip.channels,
      debug: false,
      killAllJacktripBeforeStart: false,
      localPort: settings.beeAudioSettings.jacktrip.localPort,
      queueBuffer: settings.beeAudioSettings.jacktrip.queueBufferLength,
      realtimePriority: settings.beeAudioSettings.jacktrip.realtimePriority,
      hubPatchMode: 5,
    },
  };

  // create the endpoint
  const endpoint = createFullEndpoint(
    ipAddress,
    "startJackWithJacktripHubServer"
  );

  // fetch the response
  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  // if we have an internal error
  if (response.status === 500) {
    throw new Error(POST_ERROR("startJackWithJacktripHubServer"));
  }
};

/**
 * Start Jack With Jacktrip Hub Client
 * @param ipAddress The ip address where the zwerm3api is running
 */
const startJackWithJacktripHubClient = async (
  ipAddress: string,
  clientName: string = "beeworker",
  hubServerInfo: IHubServerInfo | null = null
) => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const body = {
    jack: {
      device: settings.beeAudioSettings.jack.device,
      inputChannels: settings.beeAudioSettings.jack.inputChannels,
      outputChannels: settings.beeAudioSettings.jack.outputChannels,
      bufferSize: settings.beeAudioSettings.jack.bufferSize,
      sampleRate: settings.beeAudioSettings.jack.sampleRate,
      periods: settings.beeAudioSettings.jack.periods,
    },
    killAllProcessesBeforeStart: true,
    jacktrip: {
      channels: settings.beeAudioSettings.jacktrip.channels,
      debug: false,
      killAllJacktripBeforeStart: false,
      localPort: settings.beeAudioSettings.jacktrip.localPort,
      queueBuffer: settings.beeAudioSettings.jacktrip.queueBufferLength,
      realtimePriority: settings.beeAudioSettings.jacktrip.realtimePriority,
      bitRate: settings.beeAudioSettings.jacktrip.bitRate,
      clientName,
      host: ip.address(),
      receiveChannels: settings.beeAudioSettings.jacktrip.receiveChannels,
      redundancy: settings.beeAudioSettings.jacktrip.redundancy,
      remotePort: hubServerInfo
        ? hubServerInfo.jacktripHubServerParams.localPort
        : START_PORT_JACKTRIP_HUB_SERVER,
      sendChannels: settings.beeAudioSettings.jacktrip.sendChannels,
      connectDefaultAudioPorts: false,
    },
  };

  // create the endpoint
  const endpoint = createFullEndpoint(
    ipAddress,
    "startJackWithJacktripHubClient"
  );

  // fetch the response
  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  // if we have an internal error
  if (response.status === 500) {
    throw new Error(POST_ERROR("startJackWithJacktripHubClient"));
  }
};

/**
 * Start Jacktrip P2P Server
 * @param ipAddress The ip address where the zwerm3api is running
 * @param clientName The name of the client
 */
const startJacktripP2PServer = async (
  ipAddress: string,
  clientName: string
): Promise<void> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const body = {
    channels: settings.beeAudioSettings.jacktrip.channels,
    debug: false,
    killAllJacktripBeforeStart: false,
    localPort: settings.beeAudioSettings.jacktrip.localPort,
    queueBuffer: settings.beeAudioSettings.jacktrip.queueBufferLength,
    realtimePriority: settings.beeAudioSettings.jacktrip.realtimePriority,
    bitRate: settings.beeAudioSettings.jacktrip.bitRate,
    clientName,
    connectDefaultAudioPorts: false,
    receiveChannels: settings.beeAudioSettings.jacktrip.receiveChannels,
    sendChannels: settings.beeAudioSettings.jacktrip.sendChannels,
    redundancy: settings.beeAudioSettings.jacktrip.redundancy,
  };

  // create the endpoint
  const endpoint = createFullEndpoint(ipAddress, "startJacktripP2PServer");

  // fetch the response
  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  // if we have an internal error
  if (response.status === 500) {
    throw new Error(POST_ERROR("startJacktripP2PServer"));
  }
};

/**
 * Start Jack With Jacktrip P2P Server
 * @param ipAddress The ip address where the zwerm3api is running
 */
const startJackWithJacktripP2PServer = async (
  ipAddress: string,
  clientName: string
): Promise<void> => {
  // validate if Zwerm3API is running
  if (!(await isZwerm3ApiRunning(ipAddress)))
    throw new Error(ZWERM3_API_NOTRUNNING(ipAddress));

  // get the settings
  const settings = await SettingHelpers.getAllSettings();

  // create the post body
  const body = {
    jack: {
      device: settings.beeAudioSettings.jack.device,
      inputChannels: settings.beeAudioSettings.jack.inputChannels,
      outputChannels: settings.beeAudioSettings.jack.outputChannels,
      bufferSize: settings.beeAudioSettings.jack.bufferSize,
      sampleRate: settings.beeAudioSettings.jack.sampleRate,
      periods: settings.beeAudioSettings.jack.periods,
    },
    killAllProcessesBeforeStart: true,
    jacktrip: {
      channels: settings.beeAudioSettings.jacktrip.channels,
      debug: false,
      killAllJacktripBeforeStart: false,
      localPort: settings.beeAudioSettings.jacktrip.localPort,
      queueBuffer: settings.beeAudioSettings.jacktrip.queueBufferLength,
      realtimePriority: settings.beeAudioSettings.jacktrip.realtimePriority,
      bitRate: settings.beeAudioSettings.jacktrip.bitRate,
      clientName,
      connectDefaultAudioPorts: false,
      receiveChannels: settings.beeAudioSettings.jacktrip.receiveChannels,
      sendChannels: settings.beeAudioSettings.jacktrip.sendChannels,
      redundancy: settings.beeAudioSettings.jacktrip.redundancy,
    },
  };

  // create the endpoint
  const endpoint = createFullEndpoint(
    ipAddress,
    "startJackWithJacktripP2PServer"
  );

  // fetch the response
  const response = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  // if we have an internal error
  if (response.status === 500) {
    throw new Error(POST_ERROR("startJackWithJacktripP2PServer"));
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
  connectChannel,
  getAllConfig,
  getHubClients,
  getJackSystemClients,
  isJackRunning,
  isJacktripRunning,
  isZwerm3ApiRunning,
  killJack,
  killJackAndJacktrip,
  killJacktrip,
  saveConfig,
  startJack,
  startJackWithJacktripHubClient,
  startJackWithJacktripHubServer,
  startJackWithJacktripP2PServer,
  startJacktripP2PServer,
};
