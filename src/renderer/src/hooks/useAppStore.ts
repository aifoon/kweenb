import { AppMode } from "@shared/enums";
import { AudioScene, LoadingState } from "@shared/interfaces";
import { create } from "zustand";
import { ToastMessage } from "../interfaces";

type AppState = {
  appMode: AppMode;
  audioScenesCache: AudioScene[];
  currentLatency: number;
  loading: LoadingState;
  openAboutKweenBModal: boolean;
  openConnectBeesHubModal: boolean;
  openConnectBeesP2PModal: boolean;
  openDisconnectBeesModal: boolean;
  openTriggerOnlyModal: boolean;
  openUploadAudioFilesSettings: boolean;
  toast: ToastMessage;
  openToast: boolean;
  manageBeesCollapsed: boolean;
};

type AppAction = {
  setAppMode: (appMode: AppMode) => void;
  setAudioScenesCache: (audioScenes: AudioScene[]) => void;
  setManageBeesCollapsed: (collapsed: boolean) => void;
  setOpenAboutKweenBModal: (open: boolean) => void;
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
  appMode: AppMode.P2P,
  audioScenesCache: [],
  currentLatency: 0,
  loading: {
    loading: false,
    text: "",
    cancelButton: false,
    onCancel: () => {},
  },
  manageBeesCollapsed: true,
  openAboutKweenBModal: false,
  openConnectBeesHubModal: false,
  openConnectBeesP2PModal: false,
  openDisconnectBeesModal: false,
  openTriggerOnlyModal: false,
  openToast: false,
  openUploadAudioFilesSettings: false,
  setAppMode: (appMode: AppMode) => set({ appMode }),
  setAudioScenesCache: (audioScenes: AudioScene[]) =>
    set({ audioScenesCache: audioScenes }),
  setLoading: (loading) => set({ loading }),
  setManageBeesCollapsed: (collapsed) =>
    set({ manageBeesCollapsed: collapsed }),
  setOpenAboutKweenBModal: (open) => set({ openAboutKweenBModal: open }),
  setOpenConnectBeesHubModal: (open) => set({ openConnectBeesHubModal: open }),
  setOpenConnectBeesP2PModal: (open) => set({ openConnectBeesP2PModal: open }),
  setOpenDisconnectBeesModal: (open) => set({ openDisconnectBeesModal: open }),
  setOpenTriggerOnlyModal: (open) => set({ openTriggerOnlyModal: open }),
  setOpenUploadAudioFilesSettings: (open) =>
    set({ openUploadAudioFilesSettings: open }),
  showToast: (toast) => {
    set({ toast });
    set({ openToast: true });
  },
  toast: { message: "", severity: "info" },
  updateCurrentLatency: async () => {
    const latency = await window.kweenb.methods.calculateCurrentLatency();
    set({ currentLatency: latency });
  },
}));
