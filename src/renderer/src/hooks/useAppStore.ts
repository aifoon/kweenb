import { create } from "zustand";

type AppState = {
  manageBeesCollapsed: boolean;
};

type AppAction = {
  setManageBeesCollapsed: (collapsed: boolean) => void;
};

export const useAppStore = create<AppState & AppAction>((set) => ({
  manageBeesCollapsed: true,
  setManageBeesCollapsed: (collapsed) =>
    set({ manageBeesCollapsed: collapsed }),
}));
