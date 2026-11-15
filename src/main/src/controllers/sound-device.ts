/**
 * KweenB's own sound device and the routing of its channels to the bees
 */

import { ChildProcess, spawn } from "child_process";
import { app } from "electron";
import path from "path";
import readline from "readline";
import {
  connectChannel,
  disconnectChannel,
  isJackDmpRunning,
} from "@zwerm3/jack";
import {
  IRouting,
  IRoutingChange,
  ISoundDeviceChoice,
  ISoundDeviceInfo,
} from "@shared/interfaces";
import { BeeActiveState, ChannelType } from "@shared/enums";
import { resourcesPath } from "@shared/resources";
import { KweenBGlobal } from "../kweenb";
import Bee from "../models/Bee";
import BeeHelpers from "../lib/KweenB/BeeHelpers";
import KweenBHelpers from "../lib/KweenB/KweenBHelpers";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import {
  SOUND_DEVICE_CHANNELS,
  SOUND_DEVICE_NAME,
  SOUND_DEVICE_UID,
  SystemSoundDevice,
  getSoundDeviceState,
  installSoundDevice,
  isSoundDeviceVisible,
  listSoundDevices,
} from "../lib/SoundDevice/SoundDevice";

const BUNDLED_FOLDER = path.join(resourcesPath, "sound-device");

// the sound devices of this computer, remembered for a few seconds: the
// Routing page asks for them at every change
let knownDevices: { time: number; devices: SystemSoundDevice[] } | null = null;
const getSoundDevices = async (): Promise<SystemSoundDevice[]> => {
  if (!knownDevices || Date.now() - knownDevices.time > 5000)
    knownDevices = {
      time: Date.now(),
      devices: await listSoundDevices(BUNDLED_FOLDER),
    };
  return knownDevices.devices;
};

const describeSoundDevice = async (): Promise<ISoundDeviceInfo> => {
  const state = getSoundDeviceState(BUNDLED_FOLDER);
  const { device } = (await SettingHelpers.getAllSettings()).kweenBAudioSettings
    .jack;
  const other = device && device !== SOUND_DEVICE_UID ? device : null;
  // the device that was chosen instead, by the name people know it by
  const otherDevice = other
    ? (await getSoundDevices()).find((d) => d.uid === other)
    : undefined;
  return {
    ...state,
    name: SOUND_DEVICE_NAME,
    channels: SOUND_DEVICE_CHANNELS,
    // KweenB listens to its own device unless another one was chosen
    inUse: state.installed && !other,
    otherDevice: other ? otherDevice?.name || other : null,
    otherDeviceChannels: otherDevice ? otherDevice.inputChannels : null,
  };
};

/**
 * What is known about KweenB's sound device
 */
export const getSoundDevice = async (): Promise<ISoundDeviceInfo> =>
  describeSoundDevice();

/**
 * Install KweenB's sound device (or replace it by a newer one). The Mac asks
 * for a password and its sound stops for a moment.
 */
export const installKweenBSoundDevice = async (): Promise<
  ISoundDeviceInfo & { outcome: "installed" | "cancelled" | "failed" }
> => {
  let outcome = await installSoundDevice(BUNDLED_FOLDER);
  if (outcome === "installed") {
    // the Mac needs a moment to find the device
    let visible = false;
    for (let attempt = 0; attempt < 5 && !visible; attempt += 1) {
      // eslint-disable-next-line no-await-in-loop
      visible = await isSoundDeviceVisible();
    }
    if (!visible) outcome = "failed";
  }
  return { ...(await describeSoundDevice()), outcome };
};

/**
 * The sound devices KweenB can listen to, for the settings
 */
export const getSoundDeviceChoices = async (): Promise<
  ISoundDeviceChoice[]
> => {
  const devices = await listSoundDevices(BUNDLED_FOLDER);
  return devices
    .filter(
      (device) => device.inputChannels > 0 && device.uid !== SOUND_DEVICE_UID
    )
    .map((device) => ({
      name: device.name,
      uid: device.uid,
      channels: device.inputChannels,
    }));
};

/**
 * Which channel goes to which bee
 */
export const getRouting = async (): Promise<IRouting> => {
  const bees = await BeeHelpers.getAllBeesData(BeeActiveState.ACTIVE);
  return {
    soundDevice: await describeSoundDevice(),
    bees: bees
      .sort((a, b) => a.id - b.id)
      .map((bee) => ({
        id: bee.id,
        name: bee.name,
        stereo: bee.channelType === ChannelType.STEREO,
        channel: bee.channel1 > 0 ? bee.channel1 : null,
        channelRight: (bee.channel2 || 0) > 0 ? (bee.channel2 as number) : null,
        online: KweenBGlobal.kweenb.beeStates.isOnline(bee.id),
      })),
  };
};

const cleanChannel = (channel: unknown): number =>
  typeof channel === "number" && Number.isInteger(channel) && channel > 0
    ? channel
    : 0;

/**
 * Change the routing of bees, all at once: mono or stereo, and which
 * channels go to them. When the bees are connected a moved cord is heard
 * right away; mono or stereo itself takes effect at the next Connect.
 * @param changes What changes per bee; what is left out stays as it is
 */
export const setBeeChannels = async (
  event: Electron.IpcMainInvokeEvent,
  changes: IRoutingChange[]
): Promise<IRouting> => {
  const bees = await BeeHelpers.getAllBeesData(BeeActiveState.ALL);
  const updates = (Array.isArray(changes) ? changes : [])
    .map((change) => {
      const bee = bees.find((b) => b.id === Number(change.beeId));
      if (!bee) return null;
      const after = {
        ...bee,
        channelType:
          change.stereo === undefined
            ? bee.channelType
            : change.stereo
            ? ChannelType.STEREO
            : ChannelType.MONO,
        channel1:
          change.channel === undefined
            ? bee.channel1
            : cleanChannel(change.channel),
        channel2:
          change.channelRight === undefined
            ? bee.channel2 || 0
            : cleanChannel(change.channelRight),
      };
      // a bee that becomes stereo without a cord on its right side gets
      // the channel of its left side there too: it sounds as it did in
      // mono until its cords are moved
      if (
        after.channelType === ChannelType.STEREO &&
        bee.channelType !== ChannelType.STEREO &&
        change.channelRight === undefined &&
        after.channel2 === 0
      )
        after.channel2 = after.channel1;
      const changed =
        after.channelType !== bee.channelType ||
        after.channel1 !== bee.channel1 ||
        after.channel2 !== (bee.channel2 || 0);
      return changed ? { bee, after } : null;
    })
    .filter((update): update is NonNullable<typeof update> => update !== null);

  // remember the new routing
  await Promise.all(
    updates.map(({ after }) =>
      Bee.update(
        {
          channelType: after.channelType,
          channel1: after.channel1,
          channel2: after.channel2,
        },
        { where: { id: after.id } }
      )
    )
  );
  updates.forEach(({ after }) =>
    KweenBGlobal.kweenb.beeStates.updateBeeData({
      id: after.id,
      channelType: after.channelType,
      channel1: after.channel1,
      channel2: after.channel2,
    })
  );

  // move the cords in Jack too, when it runs. Only bees that are streaming
  // have inputs in Jack: trying to plug into a bee that has none takes
  // seconds per cord.
  if (updates.length > 0 && (await isJackDmpRunning().catch(() => false))) {
    const streaming = updates.filter(({ bee }) => {
      const stream = KweenBGlobal.kweenb.beeStates.getMonitoring(
        bee.id
      )?.stream;
      return (
        stream?.state === "running" &&
        (stream.mode === "hub" || stream.mode === "p2p")
      );
    });

    // a bee that became mono or stereo gets its stream started again: a few
    // seconds of silence on that bee only. It plugs its own cords in when
    // it is back, and it is not waited for, so the page stays usable.
    streaming
      .filter(({ bee, after: now }) => bee.channelType !== now.channelType)
      .forEach(({ after: now }) =>
        KweenBHelpers.restartStreamOfBee(now).catch((e) =>
          console.error(
            `Starting the stream of ${now.name} again failed: ${e.message}`
          )
        )
      );

    // the other bees: first every cord that is no longer there out, then
    // every new cord in
    const moved = streaming.filter(
      ({ bee, after: now }) => bee.channelType === now.channelType
    );
    const key = (c: { source: string; destination: string }) =>
      `${c.source}>${c.destination}`;
    const before = moved.flatMap(({ bee }) =>
      KweenBHelpers.getAudioConnections(bee)
    );
    const after = moved.flatMap(({ after: bee }) =>
      KweenBHelpers.getAudioConnections(bee)
    );
    const afterKeys = new Set(after.map(key));
    const beforeKeys = new Set(before.map(key));
    await Promise.all(
      before.filter((c) => !afterKeys.has(key(c))).map(disconnectChannel)
    );
    await Promise.all(
      after.filter((c) => !beforeKeys.has(key(c))).map(connectChannel)
    );
  }
  return getRouting();
};

/**
 * How loud the channels are: a small tool listens to the sound device and
 * its numbers go to the Routing page as long as that is open
 */

let levelMeter: ChildProcess | null = null;

export const stopLevels = () => {
  levelsGeneration += 1;
  if (!levelMeter) return;
  const meter = levelMeter;
  levelMeter = null;
  // the tool stops by itself when its input closes
  meter.stdin?.end();
  meter.kill();
};

// nothing keeps running when KweenB closes
app.on("before-quit", stopLevels);

// counts the starts and stops: a start that was overtaken does nothing
let levelsGeneration = 0;

export const startLevels = async () => {
  stopLevels();
  if (process.platform !== "darwin") return;
  const generation = levelsGeneration;
  const { device } = (await SettingHelpers.getAllSettings()).kweenBAudioSettings
    .jack;
  // stopped or started again while the settings were read
  if (generation !== levelsGeneration) return;
  const state = getSoundDeviceState(BUNDLED_FOLDER);
  // the device KweenB listens to
  const uid = device || (state.installed ? SOUND_DEVICE_UID : "");
  if (!uid) return;

  const meter = spawn(path.join(BUNDLED_FOLDER, "level-meter"), [uid], {
    stdio: ["pipe", "pipe", "ignore"],
  });
  levelMeter = meter;
  meter.on("error", () => {
    if (levelMeter === meter) levelMeter = null;
  });
  meter.on("close", () => {
    if (levelMeter === meter) levelMeter = null;
  });
  if (!meter.stdout) return;
  readline.createInterface({ input: meter.stdout }).on("line", (line) => {
    const { mainWindow } = KweenBGlobal.kweenb;
    if (levelMeter !== meter || mainWindow.isDestroyed()) return;
    try {
      mainWindow.webContents.send("routing-levels", JSON.parse(line));
    } catch (e) {
      // not a line of levels
    }
  });
};
