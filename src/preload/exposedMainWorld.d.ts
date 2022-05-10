import { IpcMessageEvent } from "electron";
import {
  IBee,
  IBeeConfig,
  IBeeInput,
  IError,
  ISetting,
  ITheKween,
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
        fetchActiveBees(): Promise<IBee[]>;
        fetchActiveBeesData(): Promise<IBee[]>;
        fetchAllBees(pollForOnline: boolean = true): Promise<IBee[]>;
        fetchAllBeesData(): Promise<IBee[]>;
        fetchInActiveBees(): Promise<IBee[]>;
        fetchInActiveBeesData(): Promise<IBee[]>;
        fetchBee(id: number): Promise<IBee>;
        fetchSettings(): Promise<ISettings>;
        fetchTheKween(): Promise<ITheKween>;
        isZwerm3ApiRunningOnTheKween(): Promise<boolean>;
        killJackAndJacktrip(bee: IBee): void;
        killJack(bee: IBee);
        killJackAndJacktripOnKweenB(): void;
        killJackAndJacktripOnTheKween(): void;
        killJacktrip(bee: IBee): void;
        makeAudioConnections(): void;
        saveConfig(bee: IBee, config: Partial<IBeeConfig>);
        startJack(bee: IBee): void;
        startJackWithJacktripClientBee(bee: IBee): void;
        startJackWithJacktripClientKweenB(): void;
        startHubServerOnTheKween(): void;
        updateBee(bee: Partial<IBee>);
        updateSetting(setting: ISetting);
        validateHive(): Promise<boolean>;
      };
      readonly actions: {
        hello(name: string): void;
        beesPoller(action: "start" | "stop" | "pause"): void;
        beePoller(action: "start" | "stop" | "pause", params: any[] = []): void;
        setBeeActive(id: number, active: boolean): void;
        subscribe(topic: string);
        unsubscribe(topic: string);
      };
      readonly events: {
        onError(
          callback: (event: IpcMessageEvent, error: IError) => void
        ): () => void;
        onInfo(
          callback: (event: IpcMessageEvent, message: string) => void
        ): () => void;
        onMqttMessage(
          callback: (
            event: IpcMessageEvent,
            topic: string,
            message: string
          ) => void
        ): () => void;
        onSuccess(
          callback: (event: IpcMessageEvent, message: string) => void
        ): () => void;
        onUpdateBees(
          callback: (event: IpcMessageEvent, bees: IBee[]) => void
        ): () => void;
        onUpdateBee(
          callback: (event: IpcMessageEvent, bee: IBee) => void
        ): () => void;
      };
    };
  }
}
