import { AudioScene } from "@shared/interfaces";
import { create } from "zustand";

type AppState = {
  manageBeesCollapsed: boolean;
  currentLatency: number;
  audioScenesCache: AudioScene[];
};

type AppAction = {
  setManageBeesCollapsed: (collapsed: boolean) => void;
  updateCurrentLatency: () => void;
  setAudioScenesCache: (audioScenes: AudioScene[]) => void;
};

export const useAppStore = create<AppState & AppAction>((set) => ({
  manageBeesCollapsed: true,
  currentLatency: 0,
  audioScenesCache: [],
  setAudioScenesCache: (audioScenes: AudioScene[]) =>
    set({ audioScenesCache: audioScenes }),
  setManageBeesCollapsed: (collapsed) =>
    set({ manageBeesCollapsed: collapsed }),
  updateCurrentLatency: async () => {
    const latency = await window.kweenb.methods.calculateCurrentLatency();
    set({ currentLatency: latency });
  },
}));
