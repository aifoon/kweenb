import { IpcMessageEvent } from "electron";
import {
  IBee,
  IBeeInput,
  IError,
  ISetting,
  ITheKween,
  IPozyxData,
  PositioningTargetType,
  PositioningControllerAlgorithm,
  ITargetAndOptionsForPositioningAlgorithm,
  AudioFile,
  AudioScene,
  StreamingConnectionStatus,
  AudioUploadStatusInfo,
  IAdoptSpeakerProgress,
  IAdoptFromNetworkResult,
  IAdoptSpeakerRequest,
  IAdoptSpeakerResult,
  IFlashImage,
  IFlashProgress,
  IFlashSpeakerResult,
  IFlashStorageResult,
  IFoundSpeaker,
  IRestoreSoundsResult,
  IBackupKeyResult,
  ICloudBackupState,
  ICloudProgress,
  ICloudSettings,
  ICloudSettingsInput,
  ICloudTransferResult,
  IMonitorSnapshot,
  IRouting,
  IRoutingChange,
  ISoundDeviceChoice,
  ISoundDeviceInfo,
  SoundDeviceInstallOutcome,
  ISaveSoundsResult,
  ISoundBackup,
  ISwarmBackupResult,
  ISoundsProgress,
} from "@shared/interfaces";
import { AppMode, AppViews, BeeDeviceManagerActions } from "@shared/enums";
import { DEFAULT_APP_MODE } from "@shared/consts";

declare global {
  interface Window {
    readonly kweenb: {
      readonly methods: {
        // AUDIO
        deleteAudio(
          bee: IBee,
          path: string,
          deleteOnAllBees?: boolean
        ): Promise<void>;
        getAudioFiles(bee: IBee): Promise<AudioFile[]>;
        getAudioScenes(): Promise<AudioScene[]>;
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
        stopAudio(bees: IBee[] | IBee): Promise<void>;
        uploadAudioFiles(
          name: string,
          path: string
        ): Promise<AudioUploadStatusInfo>;

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
        hookBeeOnCurrentHive(bee: IBee): void;
        startJackWithJacktripHubClientBee(bee: IBee): Promise<void>;
        startJackWithJacktripP2PServerBee(bee: IBee): Promise<void>;

        // CONFIG
        manageBeeDevice(
          bees: IBee | IBee[],
          action: BeeDeviceManagerActions
        ): Promise<void>;

        /**
         * KweenB
         */

        calculateCurrentLatency(): Promise<number>;
        disconnectP2PAudioConnectionsKweenB(): Promise<void>;
        getKweenBVersion(): Promise<string>;
        isJackAndJacktripInstalled(): Promise<boolean>;
        killJackAndJacktripOnKweenB(): Promise<void>;
        startJacktripHubServer(): Promise<void>;
        startJackWithJacktripHubClientKweenB(): Promise<void>;
        startJackWithJacktripP2PClientKweenB(bee: IBee): Promise<void>;
        makeHubAudioConnectionsKweenB(): Promise<void>;
        makeP2PAudioConnectionsKweenB(): Promise<void>;
        makeP2PAudioConnectionKweenB(bee: IBee): Promise<void>;
        openDialog(
          method: keyof Electron.Dialog,
          params: Electron.OpenDialogOptions
        ): Promise<string[]>;

        /**
         * Settings
         */

        // CRUD
        fetchSettings(): Promise<ISettings>;
        updateSetting(setting: ISetting): Promise<void>;

        /**
         * Speakers
         */

        // NEW SPEAKERS
        adoptFromNetwork(): Promise<IAdoptFromNetworkResult>;
        adoptSpeaker(
          request: IAdoptSpeakerRequest
        ): Promise<IAdoptSpeakerResult>;
        findNewSpeakers(): Promise<IFoundSpeaker[]>;

        // FLASHING A SPEAKER
        chooseFlashImage(): Promise<IFlashImage | null>;
        findSpeakerToFlash(): Promise<IFlashStorageResult>;
        flashSpeaker(imagePath: string): Promise<IFlashSpeakerResult>;
        getLastFlashImage(): Promise<IFlashImage | null>;

        // SOUNDS ON THIS COMPUTER
        getSoundBackups(): Promise<ISoundBackup[]>;

        // SOUND DEVICE AND ROUTING
        getRouting(): Promise<IRouting>;
        getSoundDevice(): Promise<ISoundDeviceInfo>;
        getSoundDeviceChoices(): Promise<ISoundDeviceChoice[]>;
        installSoundDevice(): Promise<
          ISoundDeviceInfo & { outcome: SoundDeviceInstallOutcome }
        >;
        setBeeChannels(changes: IRoutingChange[]): Promise<IRouting>;
        setBeeChannel(beeId: number, channel: number | null): Promise<IRouting>;

        // CLOUD BACKUP
        activateBackupKey(passphrase: string): Promise<IBackupKeyResult>;
        chooseBackupKey(): Promise<IBackupKeyResult | null>;
        saveBackupKey(passphrase: string): Promise<IBackupKeyResult>;
        getCloudBackupState(): Promise<ICloudBackupState>;
        getCloudSettings(): Promise<ICloudSettings>;
        getSoundsFromCloud(): Promise<ICloudTransferResult>;
        sendSoundsToCloud(): Promise<ICloudTransferResult>;
        saveCloudSettings(
          input: ICloudSettingsInput
        ): Promise<ICloudSettings & { message?: string }>;
        backUpSwarmToCloud(): Promise<ISwarmBackupResult>;

        // MONITORING
        clearMonitoring(): Promise<IMonitorSnapshot>;
        getMonitoring(): Promise<IMonitorSnapshot>;
        saveMonitoringLog(): Promise<boolean>;
        restoreSounds(
          beeId: number,
          backupName: string,
          exact?: boolean
        ): Promise<IRestoreSoundsResult>;
        getCloudSoundSets(): Promise<ISoundBackup[]>;
        restoreSoundsFromCloud(
          beeId: number,
          backupName: string,
          exact: boolean
        ): Promise<IRestoreSoundsResult>;
        saveSounds(beeIds?: number[]): Promise<ISaveSoundsResult>;

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

        /**
         * Streaming
         */

        streaming: {
          startDisconnectStreaming(): void;
          startHubStreaming(): void;
          startP2PStreaming(): void;
          startTriggerOnlyStreaming(): void;
        };
      };
      readonly actions: {
        beesPoller(action: "start" | "stop" | "pause"): void;
        beePoller(action: "start" | "stop" | "pause", params: any[] = []): void;
        cancelFlash: () => void;
        cancelCloud: () => void;
        routingLevels: (action: "start" | "stop") => void;
        followBeeLevels: (
          owner: "dashboard" | "swarm",
          beeIds: number[]
        ) => void;
        cancelSounds: () => void;
        cancelUploadAudioFiles: () => void;
        closeKweenB(): void;
        disconnectPozyxMqttBroker(): void;
        flushAudioScenes(): void;
        pauseUpdateAudioScenes(pause: boolean): void;
        setBeeActive(id: number, active: boolean): void;
        setBeePozyxTagId(bee: IBee, pozxyTagId: string): void;
        setJackFolderPath(jackFolderPath: string);
        setJacktripBinPath(jacktripBinPath: string);
        stopLookingForSpeakers: () => void;

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
        onAdoptFromNetwork(
          callback: (event: IpcMessageEvent) => void
        ): () => void;
        onNewSpeaker(callback: (event: IpcMessageEvent) => void): () => void;
        onSaveSounds(callback: (event: IpcMessageEvent) => void): () => void;
        onFlashSpeaker(callback: (event: IpcMessageEvent) => void): () => void;
        onBeeLevels(
          callback: (
            event: IpcMessageEvent,
            levels: Record<number, number>
          ) => void
        ): void;
        onCloudBackup(callback: (event: IpcMessageEvent) => void): () => void;
        onRestoreSounds(
          callback: (
            event: IpcMessageEvent,
            source: "cloud" | "computer"
          ) => void
        ): () => void;
        onCloudProgress(
          callback: (event: IpcMessageEvent, progress: ICloudProgress) => void
        ): () => void;
        onRoutingLevels(
          callback: (event: IpcMessageEvent, levels: number[]) => void
        ): () => void;
        onFlashProgress(
          callback: (event: IpcMessageEvent, progress: IFlashProgress) => void
        ): () => void;
        onAdoptSpeakerProgress(
          callback: (
            event: IpcMessageEvent,
            progress: IAdoptSpeakerProgress
          ) => void
        ): () => void;
        onAppMode(
          callback: (event: IpcMessageEvent, appMode: AppMode) => void
        ): () => void;
        onAppClosing(callback: (event: IpcMessageEvent) => void): () => void;
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
        onShowView(
          callback: (
            event: IpcMessageEvent,
            appView: AppViews,
            show: boolean
          ) => void
        ): () => void;
        onSoundsProgress(
          callback: (event: IpcMessageEvent, progress: ISoundsProgress) => void
        ): () => void;
        onStreamingConnectionStatus(
          callback: (
            event: IpcMessageEvent,
            streamConnectionStatus: StreamingConnectionStatus
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
        onUploadAudioProgress(
          callback: (
            event: IpcMessageEvent,
            bee: IBee,
            percentage: number
          ) => void
        ): () => void;
      };
    };
  }
}
