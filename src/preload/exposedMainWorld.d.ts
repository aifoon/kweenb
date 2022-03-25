import { IpcMessageEvent } from "electron";
import {
  IBee,
  IBeeInput,
  IError,
  IKweenBSettings,
  ISetting,
} from "@shared/interfaces";

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
        createBee(bee: IBeeInput): Promise<IBee>;
        deleteBee(id: number);
        fetchAllBees(pollForOnline: boolean = true): Promise<IBee[]>;
        fetchBee(id: number): Promise<IBee>;
        fetchKweenBSettings(): Promise<IKweenBSettings>;
        updateBee(bee: Partial<IBee>);
        updateKweenBSetting(setting: ISetting);
      };
      readonly actions: {
        hello(name: string): void;
        beesPoller(action: "start" | "stop" | "pause"): void;
      };
      readonly events: {
        onError(
          callback: (event: IpcMessageEvent, error: IError) => void
        ): () => void;
        onInfo(
          callback: (event: IpcMessageEvent, message: string) => void
        ): () => void;
        onSuccess(
          callback: (event: IpcMessageEvent, message: string) => void
        ): () => void;
        onUpdateBees(
          callback: (event: IpcMessageEvent, bees: IBee[]) => void
        ): () => void;
      };
    };
  }
}
