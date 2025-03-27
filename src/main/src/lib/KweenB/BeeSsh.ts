import { SSH_ERROR } from "../Exceptions/ExceptionMessages";
import { KweenBGlobal } from "../../kweenb";
import SettingHelpers from "./SettingHelpers";
import { AudioFile, AudioScene, IBee } from "@shared/interfaces";
import { AUDIO_FILES_ROOT_DIRECTORY } from "../../consts";
import { HAS_CONNECTION_WITH_PHYSICAL_SWARM } from "@shared/consts";
import { demoAudioFiles } from "@seeds/demoAudioFiles";

/**
 * Create a directory on the client
 * @param ipAddress The IP address of the client
 * @param path The path of the directory to create
 */
const writeDataToFile = async (
  ipAddress: string,
  path: string,
  data: string
) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute ssh command
    await ssh.execCommand(`echo '${data}' > ${path}`);
  } catch (e) {
    throw new Error(SSH_ERROR("createDirectory"));
  }
};

/**
 * Delete audio on the client
 * @param ipAddress
 * @param filePath
 */
const deletePath = async (ipAddress: string, path: string) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute ssh command
    await ssh.execCommand(`rm -rf ${path}`);
  } catch (e) {
    throw new Error(SSH_ERROR("deleteFile"));
  }
};

/**
 * Get the audio files on the client
 * @param ipAddress The IP address of the client
 */
const getAudioFiles = async (ipAddress: string): Promise<AudioFile[]> => {
  try {
    //
    if (!HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
      return demoAudioFiles;
    }

    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // execute the command
    const response = await ssh.execCommand(
      `ls -R ${AUDIO_FILES_ROOT_DIRECTORY}`
    );
    const fileLines = response.stdout.split("\n");
    const audioFiles: AudioFile[] = [];
    let currentDirectory: string | undefined;
    const rootDirectory = AUDIO_FILES_ROOT_DIRECTORY;
    if (
      fileLines.length === 1 &&
      fileLines.pop() === `${AUDIO_FILES_ROOT_DIRECTORY}:`
    ) {
      return audioFiles;
    }

    // loop over files
    for (const line of fileLines) {
      if (line.endsWith(":")) {
        // This line indicates a new directory
        currentDirectory = line.slice(0, -1);
        if (currentDirectory && currentDirectory !== rootDirectory) {
          audioFiles.push({
            name: currentDirectory.substring(
              currentDirectory.lastIndexOf("/") + 1
            ),
            fullPath: `${currentDirectory}`,
            files: [],
          });
        }
      } else if (line !== "") {
        // This line indicates a file inside the current directory
        if (currentDirectory && currentDirectory !== rootDirectory) {
          const file: { name: string; fullPath: string } = {
            name: line.substring(line.lastIndexOf("/") + 1),
            fullPath: `${currentDirectory}/${line}`,
          };
          if (!audioFiles.find((af) => af.fullPath === currentDirectory)) {
            audioFiles.push({
              name: currentDirectory.substring(
                currentDirectory.lastIndexOf("/") + 1
              ),
              fullPath: `${currentDirectory}`,
              files: [file],
            });
          } else {
            const audioFile = audioFiles.find(
              (af) => af.fullPath === currentDirectory
            );
            if (audioFile) {
              audioFile.files.push(file);
            }
          }
        }
      }
    }
    return audioFiles;
  } catch (e) {
    throw new Error(SSH_ERROR("getAudioFiles"));
  }
};

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
 * Check if the bee has an audio connection
 * @param ipAddress
 * @param bee
 */
const hasAudioConnection = async (ipAddress: string, bee: IBee) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );
    // execute ssh command
    const response = await ssh.execCommand(
      `jack_lsp | grep ${bee.name}:receive_1`
    );
    console.log(response);
    return response.stdout.includes("pure_data:input_1");
  } catch (e) {
    return false;
  }
};

/**
 * Make an audio connection with Jack over SSH
 * @param ipAddress
 * @param bee
 */
const makeAudioConnection = async (ipAddress: string, bee: IBee) => {
  try {
    // get the ssh connection
    const ssh = await KweenBGlobal.kweenb.beeSshConnections.getSshConnection(
      ipAddress
    );

    // while (!(await hasAudioConnection(ipAddress, bee))) {
    //   console.log("Making audio connection with " + bee.name);
    // execute ssh command
    await ssh.execCommand(
      `jack_connect ${bee.name}:receive_1 pure_data:input_1`
    );
    // }
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
  deletePath,
  getAudioFiles,
  isJackRunning,
  isJacktripRunning,
  isZwerm3ApiRunning,
  killJack,
  killJackAndJacktrip,
  killJacktrip,
  killPureData,
  makeAudioConnection,
  startPureData,
  writeDataToFile,
};
