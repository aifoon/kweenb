import { SSH_ERROR } from "../Exceptions/ExceptionMessages";
import { KweenBGlobal } from "../../kweenb";
import settings from "@main/src/.firstboot/settings";
import SettingHelpers from "./SettingHelpers";

/**
 * Check if isJackRunning on the client
 * @param ipAddress
 * @returns
 */
const isJackRunning = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute the command
    const response = await ssh.execCommand(
      "pgrep -x jackd > /dev/null && echo true || echo false"
    );

    // if the response is valid
    if (response.code === 0) {
      return response.stdout === "true";
    }

    // return false if the response is invalid
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Check if isJacktripRunning on the client
 * @param ipAddress
 * @returns
 */
const isJacktripRunning = async (ipAddress: string): Promise<boolean> => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute the command
    const response = await ssh.execCommand(
      "pgrep -x jacktrip > /dev/null && echo true || echo false"
    );

    // if the response is valid
    if (response.code === 0) {
      return response.stdout === "true";
    }

    // return false if the response is invalid
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Check if Zwerm3API is running
 * @param ipAddress
 * @returns
 */
const isZwerm3ApiRunning = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute the command
    const response = await ssh.execCommand("systemctl is-active zwermAPI");

    // if the response is valid
    if (response.code === 0) {
      return response.stdout === "active";
    }

    // return false if the response is invalid
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Kills all the jack processes on client
 * @param ipAddress
 * @returns
 */
const killJack = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute ssh command
    await ssh.execCommand("sudo killall jackd");
  } catch (e) {
    throw new Error(SSH_ERROR("killJack"));
  }
};

/**
 * Kills all the jack and jacktrip processes on client
 * @param ipAddress
 * @returns
 */
const killJackAndJacktrip = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute ssh command
    await ssh.execCommand("sudo killall jackd jacktrip");
  } catch (e) {
    throw new Error(SSH_ERROR("killJackAndJacktrip" + ipAddress));
  }
};

/**
 * Kills all the jacktrip processes on client
 * @param ipAddress
 * @returns
 */
const killJacktrip = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute ssh command
    await ssh.execCommand("sudo killall jacktrip");
  } catch (e) {
    throw new Error(SSH_ERROR("killJacktrip"));
  }
};

/**
 * Kill Pure Data on the client
 * @param ipAddress
 */
const killPureData = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute ssh command
    await ssh.execCommand("killall pd");
  } catch (e) {
    throw new Error(SSH_ERROR("killPureData"));
  }
};

/**
 * Start PureData on the client
 * @param ipAddress The IP address of the client
 */
const startPureData = async (ipAddress: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // check if pd is running
    const response = await ssh.execCommand(
      "pgrep -x pd > /dev/null && echo true || echo false"
    );

    // kill pd if it is running
    if (response.stdout === "true") {
      await ssh.execCommand("killall pd");
    }

    // get the settings
    const settings = await SettingHelpers.getAllSettings();

    // execute ssh command
    ssh.execCommand(
      `pd -r ${settings.beeAudioSettings.jack.sampleRate} -jack -nogui -audiobuf 100 -blocksize ${settings.beeAudioSettings.jack.bufferSize} /home/pi/pd-bee/bee.pd &`
    );
  } catch (e) {
    throw new Error(SSH_ERROR("startPureData"));
  }
};

export default {
  isJackRunning,
  isJacktripRunning,
  isZwerm3ApiRunning,
  killJack,
  killJackAndJacktrip,
  killJacktrip,
  killPureData,
  startPureData,
};
