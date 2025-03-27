import {
  AudioScene,
  IBee,
  InterfaceComposition,
  BeeAudioScene,
} from "@shared/interfaces";
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { useAppStore } from "./useAppStore";

export interface OrderedAudioScene {
  audioScene: AudioScene;
  order: number;
}

interface useAppPersistentStorageState {
  addOrderedAudioScene: (audioScene: OrderedAudioScene) => void;
  beeAudioScenes: BeeAudioScene[];
  cachedAudioScenes: AudioScene[];
  moveUpOrderedAudioScene: (audioScene: OrderedAudioScene) => void;
  moveDownOrderedAudioScene: (audioScene: OrderedAudioScene) => void;
  orderedAudioScenes: OrderedAudioScene[];
  removeAllAudioScenes: () => void;
  removeBeeAudioScene: (bee: IBee) => void;
  removeOrderedAudioScene: (orderedAudioScene: OrderedAudioScene) => void;
  setCachedAudioScenes: (audioScenes: AudioScene[]) => void;
  setAllBeesToAudioScene: (audioScene: AudioScene) => void;
  setSelectedInterfaceComposition: (
    selectedInterfaceComposition: InterfaceComposition | undefined
  ) => void;
  socketUrl: string;
  selectedInterfaceComposition:
    | Omit<InterfaceComposition, "composition">
    | undefined;
  setSocketUrl: (socketUrl: string) => void;
  swapAllBeeAudioScenes: (beeAudioScenes: BeeAudioScene[]) => void;
  updateBeeAudioScene: (
    bee: IBee | undefined,
    audioScene: AudioScene | undefined,
    isLooping?: boolean
  ) => BeeAudioScene;
}

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useAppPersistentStorage = create<useAppPersistentStorageState>()(
  persist(
    (set, get) => ({
      addOrderedAudioScene: (audioScene) => {
        const audioScenes = get().orderedAudioScenes;
        const index = audioScenes.findIndex(
          (oas) => audioScene.audioScene.name === oas.audioScene.name
        );
        if (index === -1) {
          set({
            orderedAudioScenes: [...audioScenes, audioScene].sort((a, b) =>
              a.audioScene.name.localeCompare(b.audioScene.name)
            ),
          });
        }
      },
      beeAudioScenes: [],
      cachedAudioScenes: [],
      moveDownOrderedAudioScene: (orderedAudioScene) => {
        const audioScenes = get().orderedAudioScenes;
        const temp = audioScenes.find(
          (scene) => scene.order === orderedAudioScene.order
        );
        const previousScene = audioScenes.find(
          (scene) => scene.order === orderedAudioScene.order - 1
        );
        if (temp && previousScene) {
          const tempOrder = temp.order;
          const previousSceneOrder = previousScene.order;
          temp.order = previousSceneOrder;
          previousScene.order = tempOrder;
          set({ orderedAudioScenes: [...audioScenes] });
        }
      },
      moveUpOrderedAudioScene: (orderedAudioScene) => {
        const audioScenes = get().orderedAudioScenes;
        const temp = audioScenes.find(
          (scene) => scene.order === orderedAudioScene.order
        );
        const nextScene = audioScenes.find(
          (scene) => scene.order === orderedAudioScene.order + 1
        );
        if (temp && nextScene) {
          const tempOrder = temp.order;
          const nextSceneOrder = nextScene.order;
          temp.order = nextSceneOrder;
          nextScene.order = tempOrder;
          set({ orderedAudioScenes: [...audioScenes] });
        }
      },
      orderedAudioScenes: [],
      removeAllAudioScenes: () => {
        const beeAudioScenes = get().beeAudioScenes;
        set({
          beeAudioScenes: beeAudioScenes.map((beeAudio) => {
            beeAudio.audioScene = undefined;
            return beeAudio;
          }),
        });
      },
      removeOrderedAudioScene: (audioScene) => {
        set({
          orderedAudioScenes: get()
            .orderedAudioScenes.filter(
              (scene) => scene.audioScene.name !== audioScene.audioScene.name
            )
            .sort((a, b) => a.audioScene.name.localeCompare(b.audioScene.name)),
        });
      },
      removeBeeAudioScene: (bee: IBee) => {
        const beeAudioScenes = get().beeAudioScenes;

        const audioSceneIndex = beeAudioScenes?.findIndex(
          (beeAudio) => beeAudio.bee.id === bee.id
        );
        if (audioSceneIndex !== -1) {
          const audioScene = beeAudioScenes[audioSceneIndex];
          audioScene.audioScene = undefined;
          set({
            beeAudioScenes: [...beeAudioScenes],
          });
        }
      },
      selectedInterfaceComposition: undefined,
      setAllBeesToAudioScene: (audioScene: AudioScene) => {
        const beeAudioScenes = get().beeAudioScenes;
        beeAudioScenes.forEach((beeAudio) => {
          const isInAudioScene = audioScene.foundOnBees.find(
            (bee) => bee.id === beeAudio.bee.id
          );
          if (isInAudioScene) beeAudio.audioScene = audioScene;
        });
        set({ beeAudioScenes });
      },
      setCachedAudioScenes: (audioScenes: AudioScene[]) => {
        set({ cachedAudioScenes: audioScenes });
      },
      setSelectedInterfaceComposition: (
        selectedInterfaceComposition: InterfaceComposition | undefined
      ) => {
        set({ selectedInterfaceComposition });
      },
      setSocketUrl: (socketUrl: string) => {
        set({ socketUrl });
      },
      socketUrl: "http://kweenb.local:4444",
      swapAllBeeAudioScenes: (beeAudioScenes: BeeAudioScene[]) => {
        set({ beeAudioScenes });
      },
      updateBeeAudioScene: (
        bee: IBee | undefined,
        audioScene: AudioScene | undefined,
        isLooping?: boolean
      ): BeeAudioScene => {
        // if bee is undefined, return an empty object
        if (!bee)
          return { bee: {}, audioScene: {}, isLooping: false } as BeeAudioScene;

        // variables
        const beeAudioScenes = get().beeAudioScenes;
        const beeAudioScenesIndex = beeAudioScenes?.findIndex(
          (beeAudio) => beeAudio.bee.id === bee.id
        );
        const beeAudioSceneExists = beeAudioScenesIndex !== -1;
        let beeAudioScene: BeeAudioScene = {
          bee,
          audioScene,
          isLooping: false,
        };

        // add to the internal beeAudioScenes if not existing, otherwise update
        if (!beeAudioSceneExists) {
          set({
            beeAudioScenes: [...beeAudioScenes, beeAudioScene],
          });
        } else {
          if (beeAudioScenes) {
            beeAudioScene = {
              ...beeAudioScene,
              isLooping:
                typeof isLooping === "undefined"
                  ? beeAudioScenes[beeAudioScenesIndex].isLooping
                  : isLooping,
            };
            beeAudioScenes[beeAudioScenesIndex] = beeAudioScene;
            set({ beeAudioScenes: [...beeAudioScenes] });
          }
        }

        // return the updated beeAudioScene
        return beeAudioScene;
      },
    }),
    {
      name: "kweenbTriggeringStates", // name of item in the storage (must be unique)
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        beeAudioScenes: state.beeAudioScenes,
        orderedAudioScenes: state.orderedAudioScenes,
        selectedInterfaceComposition: state.selectedInterfaceComposition,
        socketUrl: state.socketUrl,
      }),
      onRehydrateStorage: (state) => {
        useAppStore.setState({ rehydrated: false });
        return () => {
          useAppStore.setState({ rehydrated: true });
        };
      },
    }
  )
);
