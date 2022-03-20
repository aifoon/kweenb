import { IpcMessageEvent } from "electron";
import { IBee } from "@shared/interfaces";

declare global {
  interface Window {
    /**
     * Expose Environment versions.
     * @example
     * console.log(window.versions)
     */
    readonly versions: NodeJS.ProcessVersions;

    /**
     * Safe expose node.js API
     * @example
     * window.nodeCrypto('data')
     */
    readonly nodeCrypto: {
      sha256sum(data: import("crypto").BinaryLike): string;
    };

    /**
     * The KweenB methods
     */
    readonly kweenb: {
      readonly methods: {
        fetchAllBees(): Promise<IBee[]>;
      };
      readonly actions: {
        hello(name: string): void;
        beesPoller(action: "start" | "stop"): void;
      };
      readonly events: {
        onUpdateBees(
          callback: (event: IpcMessageEvent, bees: IBee[]) => void
        ): () => void;
      };
    };
  }
}
