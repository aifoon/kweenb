import { AppMode } from "@shared/enums";
import { AudioScene, LoadingState } from "@shared/interfaces";
import { create } from "zustand";
import { ToastMessage } from "../interfaces";
import { DEFAULT_APP_MODE } from "@shared/consts";

type AppState = {
  appMode: AppMode;
  audioScenes: AudioScene[];
  currentLatency: number;
  loading: LoadingState;
  openAboutKweenBModal: boolean;
  openBeeDeviceManagerModal: boolean;
  openConnectBeesHubModal: boolean;
  openConnectBeesP2PModal: boolean;
  openDisconnectBeesModal: boolean;
  openTriggerOnlyModal: boolean;
  openUploadAudioFilesSettings: boolean;
  toast: ToastMessage;
  openToastState: boolean;
  manageBeesCollapsed: boolean;
};

type AppAction = {
  closeToast: () => void;
  setAppMode: (appMode: AppMode) => void;
  setAudioScenes: (audioScenes: AudioScene[]) => void;
  setManageBeesCollapsed: (collapsed: boolean) => void;
  setOpenAboutKweenBModal: (open: boolean) => void;
  setOpenBeeDeviceManagerModal: (open: boolean) => void;
  setOpenConnectBeesHubModal: (open: boolean) => void;
  setOpenConnectBeesP2PModal: (open: boolean) => void;
  setOpenDisconnectBeesModal: (open: boolean) => void;
  setOpenTriggerOnlyModal: (open: boolean) => void;
  setOpenUploadAudioFilesSettings: (open: boolean) => void;
  setLoading: (loading: LoadingState) => void;
  showToast: (toast: ToastMessage) => void;
  updateCurrentLatency: () => void;
};

export const useAppStore = create<AppState & AppAction>((set) => ({
  appMode: DEFAULT_APP_MODE,
  audioScenes: [],
  closeToast: () => {
    set({ openToastState: false });
  },
  currentLatency: 0,
  loading: {
    loading: false,
    text: "What's up",
    cancelButton: false,
    onCancel: () => {},
  },
  manageBeesCollapsed: true,
  openAboutKweenBModal: false,
  openBeeDeviceManagerModal: false,
  openConnectBeesHubModal: false,
  openConnectBeesP2PModal: false,
  openDisconnectBeesModal: false,
  openTriggerOnlyModal: false,
  openToastState: false,
  openUploadAudioFilesSettings: false,
  setAppMode: (appMode: AppMode) => set({ appMode }),
  setAudioScenes: (audioScenes: AudioScene[]) =>
    set({ audioScenes: audioScenes }),
  setLoading: (loading) => set({ loading }),
  setManageBeesCollapsed: (collapsed) =>
    set({ manageBeesCollapsed: collapsed }),
  setOpenAboutKweenBModal: (open) => set({ openAboutKweenBModal: open }),
  setOpenBeeDeviceManagerModal: (open) =>
    set({ openBeeDeviceManagerModal: open }),
  setOpenConnectBeesHubModal: (open) => set({ openConnectBeesHubModal: open }),
  setOpenConnectBeesP2PModal: (open) => set({ openConnectBeesP2PModal: open }),
  setOpenDisconnectBeesModal: (open) => set({ openDisconnectBeesModal: open }),
  setOpenTriggerOnlyModal: (open) => set({ openTriggerOnlyModal: open }),
  setOpenUploadAudioFilesSettings: (open) =>
    set({ openUploadAudioFilesSettings: open }),
  showToast: (toast) => {
    set({ toast });
    set({ openToastState: true });
  },
  toast: { message: "", severity: "info" },
  updateCurrentLatency: async () => {
    const latency = await window.kweenb.methods.calculateCurrentLatency();
    set({ currentLatency: latency });
  },
}));
