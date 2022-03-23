import { contextBridge, ipcRenderer } from "electron";

import type { BinaryLike } from "crypto";
import { createHash } from "crypto";
import { IBee, IKweenBSettings, ISetting } from "@shared/interfaces";

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
    createBee: (bee: Pick<IBee, "name" | "ipAddress">) =>
      ipcRenderer.invoke("bee:createBee", bee),
    fetchAllBees: (pollForOnline: boolean = true): Promise<IBee[]> =>
      ipcRenderer.invoke("bee:fetchAllBees", pollForOnline),
    fetchBee: (id: number): Promise<IBee> =>
      ipcRenderer.invoke("bee:fetchBee", id),
    fetchKweenBSettings: (): Promise<IKweenBSettings[]> =>
      ipcRenderer.invoke("setting:fetchKweenBSettings"),
    updateBee: (bee: Partial<IBee>) => ipcRenderer.invoke("bee:updateBee", bee),
    updateKweenBSetting: (setting: ISetting) =>
      ipcRenderer.invoke("setting:updateKweenBSetting", setting),
  },
  actions: {
    sayHello: (name: string) => ipcRenderer.send("hello", name),
    beesPoller: (action: "start" | "stop"): void => {
      ipcRenderer.send("bee:beesPoller", action);
    },
  },
  events: {
    onUpdateBees: (callback: any) => {
      const channel = "update-bees";
      ipcRenderer.on(channel, callback);
      return () => ipcRenderer.removeAllListeners(channel);
    },
    onError: (callback: any) => {
      ipcRenderer.on("error", callback);
    },
    onInfo: (callback: any) => {
      ipcRenderer.on("info", callback);
    },
  },
});
