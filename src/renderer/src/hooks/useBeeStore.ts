import { create } from "zustand";
import { IBee } from "@shared/interfaces";
import { pollingInterval } from "../consts";

type BeeStoreState = {
  initializing: boolean;
  bees: IBee[];
  activeBees: IBee[];
  inActiveBees: IBee[];
};

type BeeStoreAction = {
  createBee(bee: IBee): void;
  deleteBee(id: number): void;
  setActive(id: number): void;
  setInActive(id: number): void;
  startPolling: () => void;
  stopPolling: () => void;
};

export const useBeeStore = create<BeeStoreState & BeeStoreAction>((set) => {
  let beesPoller: number;
  return {
    activeBees: [],
    deleteBee: async (id) => {
      // delete bee
      await window.kweenb.methods.deleteBee(id);

      // update the store
      set((state) => {
        return {
          ...state,
          bees: state.bees.filter((bee) => bee.id !== id),
          activeBees: state.activeBees.filter((bee) => bee.id !== id),
          inActiveBees: state.inActiveBees.filter((bee) => bee.id !== id),
        };
      });
    },
    bees: [],
    createBee: async (bee) => {
      // create bee
      const createdBee = await window.kweenb.methods.createBee(bee);

      // update the store
      set((state) => {
        return {
          ...state,
          bees: [...state.bees, createdBee].sort((a, b) => a.id - b.id),
          activeBees: [...state.activeBees, createdBee].sort(
            (a, b) => a.id - b.id
          ),
        };
      });
    },
    inActiveBees: [],
    initializing: true,
    setActive: async (id) => {
      // set bee active
      await window.kweenb.actions.setBeeActive(id, true);

      // update the store
      set((state) => {
        // find the bee
        const bee = state.bees.find((bee) => bee.id === id);
        if (!bee) return state;

        // set active
        bee.isActive = true;

        // return the updated state
        return {
          ...state,
          bees: [...state.bees, bee].sort((a, b) => a.id - b.id),
          activeBees: [...state.activeBees, bee].sort((a, b) => a.id - b.id),
          inActiveBees: state.inActiveBees.filter((bee) => bee.id !== id),
        };
      });
    },
    setInActive: async (id) => {
      // set bee inactive
      await window.kweenb.actions.setBeeActive(id, false);

      // update the store
      set((state) => {
        // find the bee
        const bee = state.bees.find((bee) => bee.id === id);
        if (!bee) return state;

        // set inactive
        bee.isActive = false;

        // return the updated state
        return {
          ...state,
          bees: [...state.bees, bee].sort((a, b) => a.id - b.id),
          activeBees: state.activeBees.filter((bee) => bee.id !== id),
          inActiveBees: [...state.inActiveBees, bee].sort(
            (a, b) => a.id - b.id
          ),
        };
      });
    },
    startPolling: () => {
      // a function that fetches all bees and updates the store
      const updateBeesState = async () => {
        const allBees = await window.kweenb.methods.fetchAllBees();
        set({
          bees: allBees,
          activeBees: allBees.filter((bee) => bee.isActive),
          inActiveBees: allBees.filter((bee) => !bee.isActive),
        });
      };

      // init the first fetch immediately
      updateBeesState().then(() => set({ initializing: false }));

      // start the polling
      beesPoller = window.setInterval(updateBeesState, pollingInterval);
    },
    stopPolling: () => {
      clearInterval(beesPoller);
    },
  };
});
