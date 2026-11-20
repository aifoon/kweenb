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
  IRemoteInterface,
  FlashKind,
  ISatellite,
  ISendToSatelliteAnswer,
  IUpdateAnswer,
  IUpdateProgress,
  IUpdatesState,
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
        fetchBee(id: number): Promise<IBee>;
        fetchAllBees(): Promise<IBee[]>;

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
        getKweenBVersion(): Promise<string>;
        getRemoteInterface(): Promise<IRemoteInterface>;
        findSatellites(): Promise<ISatellite[]>;
        sendToSatellite(satellite: ISatellite): Promise<ISendToSatelliteAnswer>;
        checkForUpdates(): Promise<IUpdatesState>;
        updateDevice(key: string): Promise<IUpdateAnswer>;
        downloadKweenB(): Promise<IUpdateAnswer>;
        openRemoteInterface(): Promise<void>;
        startJackWithJacktripP2PClientKweenB(bee: IBee): Promise<void>;
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
        chooseFlashImage(kind?: FlashKind): Promise<IFlashImage | null>;
        findSpeakerToFlash(kind?: FlashKind): Promise<IFlashStorageResult>;
        flashSpeaker(
          imagePath: string,
          kind?: FlashKind
        ): Promise<IFlashSpeakerResult>;
        getLastFlashImage(kind?: FlashKind): Promise<IFlashImage | null>;

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
        onFlashSpeaker(
          callback: (event: IpcMessageEvent, kind?: FlashKind) => void
        ): () => void;
        onBeeLevels(
          callback: (
            event: IpcMessageEvent,
            levels: Record<number, number>
          ) => void
        ): void;
        onCloudBackup(callback: (event: IpcMessageEvent) => void): () => void;
        onCheckForUpdates(
          callback: (event: IpcMessageEvent) => void
        ): () => void;
        onUpdatesAvailable(
          callback: (event: IpcMessageEvent, state: IUpdatesState) => void
        ): () => void;
        onUpdateProgress(
          callback: (event: IpcMessageEvent, progress: IUpdateProgress) => void
        ): () => void;
        onSendToSatellite(
          callback: (event: IpcMessageEvent) => void
        ): () => void;
        onRemoteInterface(
          callback: (event: IpcMessageEvent) => void
        ): () => void;
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
