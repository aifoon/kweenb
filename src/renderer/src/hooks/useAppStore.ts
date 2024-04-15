import { create } from "zustand";

type AppState = {
  manageBeesCollapsed: boolean;
  currentLatency: number;
};

type AppAction = {
  setManageBeesCollapsed: (collapsed: boolean) => void;
  updateCurrentLatency: () => void;
};

export const useAppStore = create<AppState & AppAction>((set) => ({
  manageBeesCollapsed: true,
  currentLatency: 0,
  setManageBeesCollapsed: (collapsed) =>
    set({ manageBeesCollapsed: collapsed }),
  updateCurrentLatency: async () => {
    const latency = await window.kweenb.methods.calculateCurrentLatency();
    set({ currentLatency: latency });
  },
}));
