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
    readonly kweenb: {
      readonly methods: {
        // AUDIO
        killPureData(bee: IBee): Promise<void>;
        setAudioParam(
          bees: IBee[] | IBee,
          pdAudioParam: PDAudioParam,
          value: number | boolean
        ): Promise<void>;
        setAudioParamForAllBees(
          pdAudioParam: PDAudioParam,
          value: number | boolean
        ): Promise<void>;
        startAudio(bees: IBee[] | IBee, value: string): Promise<void>;
        startPureData(bees: IBee[] | IBee): Promise<void>;
        stopAudio(bees: IBee[] | IBee): Promise<void>;

        // CRUD BEE
        createBee(bee: IBeeInput): Promise<IBee>;
        deleteBee(id: number);
        updateBee(bee: Partial<IBee>);
        getCurrentBeeStates(bees: IBee[]): Promise<IBeeState[]>;
        fetchBee(id: number): Promise<IBee>;
        fetchActiveBees(): Promise<IBee[]>;
        fetchActiveBeesData(): Promise<IBee[]>;
        fetchAllBees(): Promise<IBee[]>;
        fetchAllBeesData(): Promise<IBee[]>;
        fetchInActiveBees(): Promise<IBee[]>;
        fetchInActiveBeesData(): Promise<IBee[]>;

        // JACK/JACKTRIP
        killJackAndJacktrip(bee: IBee): Promise<void>;
        killJack(bee: IBee);
        killJacktrip(bee: IBee): void;
        hookBeeOnCurrentHive(bee: IBee): void;
        makeP2PAudioConnectionBee(bee: IBee): Promise<void>;
        startJack(bee: IBee): void;
        startJackWithJacktripHubClientBee(bee: IBee): Promise<void>;
        startJackWithJacktripP2PServerBee(bee: IBee): Promise<void>;

        // CONFIG
        getBeeConfig(bee: IBee | number): Promise<IBeeConfig>;
        saveConfig(bee: IBee, config: Partial<IBeeConfig>);

        /**
         * KweenB
         */

        calculateCurrentLatency(): Promise<number>;
        disconnectP2PAudioConnectionsKweenB(): Promise<void>;
        getKweenBVersion(): Promise<string>;
        isJackAndJacktripInstalled(): Promise<boolean>;
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
        updateSetting(setting: ISetting): Promise<void>;

        /**
         * Presets
         */

        getAudioPresets(): Promise<IAudioPreset[]>;
        activatePreset(fileName: string): Promise<void>;

        theKween: {
          fetchTheKween(): Promise<ITheKween>;
          isZwerm3ApiRunningOnTheKween(): Promise<boolean>;
          killJackAndJacktripOnTheKween(): Promise<void>;
          startHubServerOnTheKween(): Promise<void>;
          validateHive(): Promise<boolean>;
          makeHubAudioConnections(): Promise<void>;
        };

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
        onLoading(
          callback: (
            event: IpcMessageEvent,
            loading: boolean,
            text: string
          ) => void
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
