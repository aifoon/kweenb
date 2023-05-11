import { create } from "zustand";

type PositioningStoreState = {
  pozyxBrokerConnected: boolean;
};

type PositioningStoreActions = {
  pozyxBrokerConnect: () => void;
  pozyxBrokerDisconnect: () => void;
};

export const usePositioningStore = create<
  PositioningStoreState & PositioningStoreActions
>((set) => ({
  pozyxBrokerConnected: false,
  pozyxBrokerConnect: () => set((state) => ({ pozyxBrokerConnected: true })),
  pozyxBrokerDisconnect: () =>
    set((state) => ({ pozyxBrokerConnected: false })),
}));
