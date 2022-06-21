import { IpcMessageEvent } from "electron";
import {
  IBee,
  IBeeConfig,
  IBeeInput,
  IError,
  ISetting,
  ITheKween,
} from "@shared/interfaces";
import { AppMode } from "@shared/enums";

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
        /**
         * Bee
         */

        // CRUD BEE
        createBee(bee: IBeeInput): Promise<IBee>;
        deleteBee(id: number);
        updateBee(bee: Partial<IBee>);
        fetchBee(id: number): Promise<IBee>;
        fetchActiveBees(): Promise<IBee[]>;
        fetchActiveBeesData(): Promise<IBee[]>;
        fetchAllBees(pollForOnline: boolean = true): Promise<IBee[]>;
        fetchAllBeesData(): Promise<IBee[]>;
        fetchInActiveBees(): Promise<IBee[]>;
        fetchInActiveBeesData(): Promise<IBee[]>;

        // JACK/JACKTRIP
        killJackAndJacktrip(bee: IBee): void;
        killJack(bee: IBee);
        killJacktrip(bee: IBee): void;
        hookBeeOnCurrentHive(bee: Ibee): void;
        makeP2PAudioConnectionBee(bee: IBee): void;
        startJack(bee: IBee): void;
        startJackWithJacktripHubClientBee(bee: IBee): void;
        startJackWithJacktripP2PServerBee(bee: IBee): void;

        // CONFIG
        saveConfig(bee: IBee, config: Partial<IBeeConfig>);

        /**
         * KweenB
         */

        killJackAndJacktripOnKweenB(): void;
        startJackWithJacktripHubClientKweenB(): void;
        startJackWithJacktripP2PClientKweenB(bee: IBee): void;
        makeP2PAudioConnectionsKweenB(): void;
        makeP2PAudioConnectionKweenB(bee: IBee): void;

        /**
         * Settings
         */

        // CRUD
        fetchSettings(): Promise<ISettings>;
        updateSetting(setting: ISetting);

        /**
         * The Kween
         */
        theKween: {
          fetchTheKween(): Promise<ITheKween>;
          isZwerm3ApiRunningOnTheKween(): Promise<boolean>;
          killJackAndJacktripOnTheKween(): void;
          startHubServerOnTheKween(): void;
          validateHive(): Promise<boolean>;
          makeHubAudioConnections(): void;
        };
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
        onAppMode(
          callback: (event: IpcMessageEvent, appMode: AppMode) => void
        ): () => void;
        onClosing(
          callback: (event: IpcMessageEvent, error: IError) => void
        ): () => void;
        onError(
          callback: (event: IpcMessageEvent, error: IError) => void
        ): () => void;
        onImportedBees(
          callback: (event: IpcMessageEvent, message: string) => void
        ): () => void;
        onImportedSettings(
          callback: (event: IpcMessageEvent, message: string) => void
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
