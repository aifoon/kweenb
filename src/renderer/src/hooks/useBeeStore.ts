import { create } from "zustand";
import { IBee } from "@shared/interfaces";
import { pollingInterval } from "../consts";
import { keepUnchanged, visibleInterval } from "./visible";

type BeeStoreState = {
  initializing: boolean;
  bees: IBee[];
  activeBees: IBee[];
  inActiveBees: IBee[];
};

type BeeStoreAction = {
  createBee(bee: IBee): void;
  deleteBee(id: number): void;
  initializeBees(): Promise<void>;
  setActive(id: number): Promise<void>;
  setInActive(id: number): Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
};

export const useBeeStore = create<BeeStoreState & BeeStoreAction>(
  (set, get) => {
    let stopPoller: (() => void) | null = null;

    // fetch all bees and update the store, when there is something new
    const updateBeesState = async () => {
      const fetched = await window.kweenb.methods.fetchAllBees();
      const before = get().bees;
      const bees = keepUnchanged(before, fetched);
      if (bees === before) return;
      set({
        bees,
        activeBees: bees.filter((bee) => bee.isActive),
        inActiveBees: bees.filter((bee) => !bee.isActive),
      });
    };

    return {
      activeBees: [],
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
      inActiveBees: [],
      initializeBees: async () => {
        // initialize the bees
        set({ initializing: true });

        // init the first fetch immediately
        updateBeesState().then(() => set({ initializing: false }));
      },
      initializing: true,
      setActive: async (id) => {
        // set bee active
        await window.kweenb.actions.setBeeActive(id, true);

        // update the store
        set((state) => {
          // find the bee
          const found = state.bees.find((bee) => bee.id === id);
          if (!found) return state;

          // set active (a new object: the screens that show this bee follow)
          const bee = { ...found, isActive: true };

          // return the updated state
          return {
            ...state,
            bees: state.bees.map((b) => (b.id === id ? bee : b)),
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
          const found = state.bees.find((bee) => bee.id === id);
          if (!found) return state;

          // set inactive (a new object: the screens that show this bee follow)
          const bee = { ...found, isActive: false };

          // return the updated state
          return {
            ...state,
            bees: state.bees.map((b) => (b.id === id ? bee : b)),
            activeBees: state.activeBees.filter((bee) => bee.id !== id),
            inActiveBees: [...state.inActiveBees, bee].sort(
              (a, b) => a.id - b.id
            ),
          };
        });
      },
      startPolling: () => {
        // initialize the bees
        useBeeStore
          .getState()
          .initializeBees()
          .then(() => {
            // start the polling
            // (not while KweenB is out of sight)
            if (stopPoller) stopPoller();
            stopPoller = visibleInterval(updateBeesState, pollingInterval);
          });
      },
      stopPolling: () => {
        if (stopPoller) stopPoller();
        stopPoller = null;
      },
    };
  }
);
