import { contextBridge, ipcRenderer } from "electron";

import type { BinaryLike } from "crypto";
import { createHash } from "crypto";
import {
  IBee,
  IBeeConfig,
  IBeeInput,
  ISetting,
  ISettings,
  ITheKween,
} from "@shared/interfaces";

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
    /**
     * Bee
     */

    // CRUD BEE
    createBee: (bee: IBeeInput): Promise<IBee> =>
      ipcRenderer.invoke("bee:createBee", bee),
    deleteBee: (id: number) => {
      ipcRenderer.invoke("bee:deleteBee", id);
    },
    updateBee: (bee: Partial<IBee>) => ipcRenderer.invoke("bee:updateBee", bee),
    fetchBee: (id: number): Promise<IBee> =>
      ipcRenderer.invoke("bee:fetchBee", id),
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

    // JACK/JACKTRIP
    killJackAndJacktrip: (bee: IBee) =>
      ipcRenderer.invoke("bee:killJackAndJacktrip", bee),
    killJack: (bee: IBee) => ipcRenderer.invoke("bee:killJack", bee),
    killJacktrip: (bee: IBee) => ipcRenderer.invoke("bee:killJacktrip", bee),
    hookBeeOnCurrentHive: (bee: IBee) =>
      ipcRenderer.invoke("bee:hookOnCurrentHive", bee),
    makeP2PAudioConnectionBee: (bee: IBee) =>
      ipcRenderer.invoke("bee:makeP2PAudioConnection", bee),
    startJack: (bee: IBee) => ipcRenderer.invoke("bee:startJack", bee),
    startJackWithJacktripHubClientBee: (bee: IBee) =>
      ipcRenderer.invoke("bee:startJackWithJacktripHubClient", bee),
    startJackWithJacktripP2PServerBee: (bee: IBee) =>
      ipcRenderer.invoke("bee:startJackWithJacktripP2PServer", bee),

    // CONFIG
    saveConfig: (bee: IBee, config: Partial<IBeeConfig>) =>
      ipcRenderer.invoke("bee:saveConfig", bee, config),

    /**
     * KweenB
     */

    // JACK/JACKTRIP
    killJackAndJacktripOnKweenB: () =>
      ipcRenderer.invoke("kweenb:killJackAndJacktrip"),
    startJackWithJacktripHubClientKweenB: () =>
      ipcRenderer.invoke("kweenb:startJackWithJacktripHubClient"),
    startJackWithJacktripP2PClientKweenB: (bee: IBee) =>
      ipcRenderer.invoke("kweenb:startJackWithJacktripP2PClient", bee),
    makeP2PAudioConnectionsKweenB: () =>
      ipcRenderer.invoke("kweenb:makeP2PAudioConnections"),
    makeP2PAudioConnectionKweenB: (bee: IBee) =>
      ipcRenderer.invoke("kweenb:makeP2PAudioConnection", bee),

    /**
     * Settings
     */

    // CRUD

    fetchSettings: (): Promise<ISettings[]> =>
      ipcRenderer.invoke("setting:fetchSettings"),
    updateSetting: (setting: ISetting) =>
      ipcRenderer.invoke("setting:updateSetting", setting),

    /**
     * The Kween
     */
    theKween: {
      killJackAndJacktripOnTheKween: () =>
        ipcRenderer.invoke("thekween:killJackAndJacktrip"),
      startHubServerOnTheKween: () =>
        ipcRenderer.invoke("thekween:startHubServer"),
      makeHubAudioConnections: () =>
        ipcRenderer.invoke("thekween:makeHubAudioConnections"),
      validateHive: (): Promise<boolean> =>
        ipcRenderer.invoke("thekween:validateHive"),

      fetchTheKween: (): Promise<ITheKween> =>
        ipcRenderer.invoke("thekween:fetchTheKween"),
      isZwerm3ApiRunningOnTheKween: (): Promise<boolean> =>
        ipcRenderer.invoke("thekween:isZwerm3ApiRunningOnTheKween"),
    },
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
    onAppMode: (callback: any) => {
      ipcRenderer.on("app-mode", callback);
    },
    onClosing: (callback: any) => {
      ipcRenderer.on("closing", callback);
    },
    onError: (callback: any) => {
      ipcRenderer.on("error", callback);
    },
    onImportedBees: (callback: any) => {
      const channel = "imported-bees";
      ipcRenderer.on(channel, callback);
      return () => ipcRenderer.removeAllListeners(channel);
    },
    onImportedSettings: (callback: any) => {
      const channel = "imported-settings";
      ipcRenderer.on(channel, callback);
      return () => ipcRenderer.removeAllListeners(channel);
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
  },
});
