import { create } from "zustand";

type AppState = {
  masterVolume: number;
  masterLow: number;
  masterHigh: number;
  rehydrated: boolean;
};

type AppAction = {
  setMasterVolume: (masterVolume: number) => void;
  setMasterLow: (masterLow: number) => void;
  setMasterHigh: (masterHigh: number) => void;
};

export const useAppStore = create<AppState & AppAction>((set) => ({
  masterVolume: 50,
  masterLow: 50,
  masterHigh: 50,
  rehydrated: false,
  setMasterVolume: (masterVolume) => set({ masterVolume }),
  setMasterLow: (masterLow) => set({ masterLow }),
  setMasterHigh: (masterHigh) => set({ masterHigh }),
}));
