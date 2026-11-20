/**
 * A file with some constants
 */

import path from "path";
import { resourcesPath } from "@shared/resources";
import { app } from "electron";

/**
 * Paths
 */

export const MAIN_PATH = `${
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "..")
    : path.join(__dirname)
}`;

/**
 * Sezqualize Configuration
 */

// turn on/off logging for the sequelize database
export const SEQUELIZE_LOGGING = false;

/**
 * Polling Configurations
 */

// a bee sends its status every 2 seconds; when nothing arrived for this
// amount of seconds the bee is considered to be offline
export const BEE_CONSIDERED_OFFLINE_SECONDS = 6;

// the interval we use to poll the audio scenes (check each x seconds)
export const AUDIOSCENES_POLLING_SECONDS = 5;

// the interval we use to remove flagged audio scenes (check each x seconds)
// this is the interval, almost the same as the timing needed for indexing
// The timing on the pi is 5 minutes, so we need to wait for 5 minutes
// we added extra 30 seconds to be sure that the audio scenes are removed
export const AUDIOSCENES_REMOVING_SECONDS = 5 * 60 + 30;

/**
 * Zwerm3 API Configuration
 */

// the port on which the ZWERM3 API is running
export const ZWERM3API_PORT = 3000;

/**
 * Bee Network Configuration
 */

// a bee with a number lives on a fixed address: <prefix>.<offset + number>
// (bee 7 is found on 192.168.50.107)
export const BEE_ADDRESS_PREFIX = "192.168.50";
export const BEE_ADDRESS_OFFSET = 100;

/**
 * Audio File Management
 */

// the path under which the database knows the audio scenes of a bee
// (<root>/<legal name of the scene>). The bee itself only needs the legal
// name, the root is kept so the scenes that are already in the database match.
export const AUDIO_FILES_ROOT_DIRECTORY = "/home/pi/pd-bee/files";

/**
 * Default Configurations
 */

// the user data path
export const USER_DATA =
  process.env.NODE_ENV === "development"
    ? `${resourcesPath}`
    : path.join(app.getPath("userData"));

// Jack and JackTrip travel inside KweenB (scripts/fetch-audio-tools.sh
// puts them in resources/ before KweenB is built)
export const BUNDLED_JACK_FOLDER = path.join(resourcesPath, "jack");
export const BUNDLED_JACKTRIP_BIN = path.join(
  resourcesPath,
  "jacktrip",
  "jacktrip"
);

// the folder on this computer where the sounds of the bees are saved,
// as long as the user did not choose another one
export const DEFAULT_BACKUP_FOLDER = path.join(
  app.getPath("documents"),
  "KweenB Backups"
);

// the default status of a bee
export const DEFAULT_BEE_STATUS = {
  isJackRunning: false,
  isJacktripRunning: false,
};

// this is the remaining disk space threshold in MB
// if the disk space is below this threshold, we will warn the user
// and stop the audio scenes from being created
// this is the threshold we use to check if the disk space is low
// we use this to prevent the disk from being full and causing issues
export const DISK_REMAINING_ON_BEE_TRESHOLD_MB = 4000;

/**
 * Jacktrip Configuration
 */

// the starting port of jacktrip
export const START_PORT_JACKTRIP = 4464;

// the port of the jacktrip HUB server
export const START_PORT_JACKTRIP_HUB_SERVER = 4495;


// the audio buffer of Pure Data on the bees (in milliseconds)
export const PD_AUDIO_BUFFER_MS = 20;

// the version of the stored settings, raised when their meaning changes
export const SETTINGS_VERSION = "2";

// the sound card of the bees
export const BEE_JACK_DEVICE = "hw:sndrpihifiberry";

// Jacktrip conceals late packets with this buffer strategy;
// the queue buffer is then a tolerance in milliseconds
export const JACKTRIP_BUFFER_STRATEGY = 3;


/**
 * Positioning Configuration
 */

// this is the interval in which the positioning controller is called
export const POSITIONING_INTERVAL_MS = 200;
export const OSCMONITOR_PORT = 8110;
export const REAPER_OSC_PORT = 8111;

/**
 * Socket Configuration
 */

export const SOCKET_PORT = 4444;

// the port of the remote interface (see public/server.js)
export const REMOTE_INTERFACE_PORT = 5050;

// Where the files are that go with KweenB (the image for the speakers, the
// backup key). The address forwards to a folder that asks for a password,
// so it can move without a new version of KweenB.
export const ASSETS_URL = "https://kweenb-assets.studiodeep.ai";
