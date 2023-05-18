import { IpcMessageEvent } from "electron";
import {
  IBee,
  IBeeConfig,
  IBeeInput,
  IError,
  ISetting,
  ITheKween,
  IPozyxData,
  PositioningTargetType,
  PositioningControllerAlgorithm,
  ITargetAndOptionsForPositioningAlgorithm,
} from "@shared/interfaces";
import { AppMode } from "@shared/enums";

declare global {
  interface Window {
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
        killJackAndJacktrip(bee: IBee): Promise<void>;
        killJack(bee: IBee);
        killJacktrip(bee: IBee): void;
        hookBeeOnCurrentHive(bee: Ibee): void;
        makeP2PAudioConnectionBee(bee: IBee): Promise<void>;
        startJack(bee: IBee): void;
        startJackWithJacktripHubClientBee(bee: IBee): Promise<void>;
        startJackWithJacktripP2PServerBee(bee: IBee): Promise<void>;

        // CONFIG
        saveConfig(bee: IBee, config: Partial<IBeeConfig>);

        /**
         * KweenB
         */

        disconnectP2PAudioConnectionsKweenB(): Promise<void>;
        getKweenBVersion(): Promise<string>;
        killJackAndJacktripOnKweenB(): Promise<void>;
        startJackWithJacktripHubClientKweenB(): Promise<void>;
        startJackWithJacktripP2PClientKweenB(bee: IBee): Promise<void>;
        makeP2PAudioConnectionsKweenB(): Promise<void>;
        makeP2PAudioConnectionKweenB(bee: IBee): Promise<void>;

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
          killJackAndJacktripOnTheKween(): Promise<void>;
          startHubServerOnTheKween(): Promise<void>;
          validateHive(): Promise<boolean>;
          makeHubAudioConnections(): Promise<void>;
        };

        /**
         * Positioning
         */
        positioning: {
          connectPozyxMqttBroker(pozyxMqttBrokerUrl: string): Promise<boolean>;
          getAllTagIds(): Promise<string[]>;
          getTargetsAndOptionsForAlgorithm: <TAlgorithmOptions>(
            algorithm: PositioningControllerAlgorithm
          ) => Promise<
            ITargetAndOptionsForPositioningAlgorithm<TAlgorithmOptions>
          >;
        };
      };
      readonly actions: {
        hello(name: string): void;
        beesPoller(action: "start" | "stop" | "pause"): void;
        beePoller(action: "start" | "stop" | "pause", params: any[] = []): void;
        disconnectPozyxMqttBroker(): void;
        setBeeActive(id: number, active: boolean): void;
        setBeePozyxTagId(bee: IBee, pozxyTagId: string): void;
        setJackFolderPath(jackFolderPath: string);
        setJacktripBinPath(jacktripBinPath: string);

        /**
         * Positioning
         */

        positioning: {
          enablePositioningControllerAlgorithm: (
            algorithm: PositioningControllerAlgorithm,
            enabled: boolean
          ) => void;
          enablePositioningControllerTargetType: (
            targetType: PositioningTargetType,
            enabled: boolean
          ) => void;
          updatePositioningControllerAlgorithmOptions: <TAlgorithmOptions>(
            algorithm: PositioningControllerAlgorithm,
            options: Partial<TAlgorithmOptions>
          ) => void;
        };
      };
      readonly events: {
        onAboutKweenB(callback: (event: IpcMessageEvent) => void): () => void;
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
        onPozyxData(
          callback: (
            event: IpcMessageEvent,
            pozyxData: Map<string, IPozyxData>
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
