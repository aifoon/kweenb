import { contextBridge, ipcRenderer } from "electron";

import type { BinaryLike } from "crypto";
import { createHash } from "crypto";
import {
  IBee,
  IBeeConfig,
  IBeeInput,
  IKweenBSettings,
  ISetting,
  ISettings,
  ITheKween,
} from "@shared/interfaces";
import * as mqtt from "mqtt";

/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Expose Environment versions.
 * @example
 * console.log( window.versions )
 */
contextBridge.exposeInMainWorld("versions", process.versions);

/**
 * Safe expose node.js API
 * @example
 * window.nodeCrypto('data')
 */
contextBridge.exposeInMainWorld("nodeCrypto", {
  sha256sum(data: BinaryLike) {
    const hash = createHash("sha256");
    hash.update(data);
    return hash.digest("hex");
  },
});

/**
 * Exposing the KweenB API in the main world
 */
contextBridge.exposeInMainWorld("kweenb", {
  methods: {
    createBee: (bee: IBeeInput): Promise<IBee> =>
      ipcRenderer.invoke("bee:createBee", bee),
    deleteBee: (id: number) => {
      ipcRenderer.invoke("bee:deleteBee", id);
    },
    fetchActiveBees: (): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchActiveBees"),
    fetchActiveBeesData: (): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchActiveBeesData"),
    fetchAllBees: (pollForOnline: boolean = true): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchAllBees", pollForOnline),
    fetchAllBeesData: (): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchAllBeesData"),
    fetchInActiveBees: (): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchInActiveBees"),
    fetchInActiveBeesData: (): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchInActiveBeesData"),
    fetchBee: (id: number): Promise<IBee> =>
      ipcRenderer.invoke("bee:fetchBee", id),
    fetchSettings: (): Promise<ISettings[]> =>
      ipcRenderer.invoke("setting:fetchSettings"),
    fetchTheKween: (): Promise<ITheKween> =>
      ipcRenderer.invoke("thekween:fetchTheKween"),
    isZwerm3ApiRunningOnTheKween: (): Promise<boolean> =>
      ipcRenderer.invoke("thekween:isZwerm3ApiRunningOnTheKween"),
    killJackAndJacktrip: (bee: IBee) =>
      ipcRenderer.invoke("bee:killJackAndJacktrip", bee),
    killJackAndJacktripOnTheKween: () =>
      ipcRenderer.invoke("thekween:killJackAndJacktrip"),
    killJack: (bee: IBee) => ipcRenderer.invoke("bee:killJack", bee),
    killJacktrip: (bee: IBee) => ipcRenderer.invoke("bee:killJacktrip", bee),
    saveConfig: (bee: IBee, config: Partial<IBeeConfig>) =>
      ipcRenderer.invoke("bee:saveConfig", bee, config),
    startJack: (bee: IBee) => ipcRenderer.invoke("bee:startJack", bee),
    updateBee: (bee: Partial<IBee>) => ipcRenderer.invoke("bee:updateBee", bee),
    updateSetting: (setting: ISetting) =>
      ipcRenderer.invoke("setting:updateSetting", setting),
  },
  actions: {
    sayHello: (name: string) => ipcRenderer.send("hello", name),
    setBeeActive: (id: number, active: boolean) =>
      ipcRenderer.send("bee:setBeeActive", id, active),
    beePoller: (
      action: "start" | "stop" | "pause",
      params: any[] = []
    ): void => {
      ipcRenderer.send("bee:beePoller", action, params);
    },
    beesPoller: (action: "start" | "stop" | "pause"): void => {
      ipcRenderer.send("bee:beesPoller", action);
    },
    subscribe: (topic: string) => ipcRenderer.send("mqtt:subscribe", topic),
    unsubscribe: (topic: string) => ipcRenderer.send("mqtt:unsubscribe", topic),
  },
  events: {
    onUpdateBees: (callback: any) => {
      const channel = "update-bees";
      ipcRenderer.on(channel, callback);
      return () => ipcRenderer.removeAllListeners(channel);
    },
    onUpdateBee: (callback: any) => {
      const channel = "update-bee";
      ipcRenderer.on(channel, callback);
      return () => ipcRenderer.removeAllListeners(channel);
    },
    onError: (callback: any) => {
      ipcRenderer.on("error", callback);
    },
    onInfo: (callback: any) => {
      ipcRenderer.on("info", callback);
    },
    onMqttMessage: (callback: any) => {
      const channel = "mqtt-message";
      ipcRenderer.on(channel, callback);
      return () => ipcRenderer.removeAllListeners(channel);
    },
    onSuccess: (callback: any) => {
      ipcRenderer.on("success", callback);
    },
  },
});
