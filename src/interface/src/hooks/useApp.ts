import React, { useEffect, useState } from "react";
import {
  BeeAudioScene,
  useAppPersistentStorage,
} from "./useAppPersistentStorage";
import { useSocket } from "./useSocket";
import { IBee } from "@shared/interfaces";
import { useAppStore } from "./useAppStore";

export const useApp = () => {
  // set state for loading purpose
  const [loading, setLoading] = useState(true);

  // let socket io help us
  const { sendToServerAndExpectResponseAsync } = useSocket();

  // get the saved bee audio scenes
  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  // get the saved bee audio scenes
  const swapAllBeeAudioScenes = useAppPersistentStorage(
    (state) => state.swapAllBeeAudioScenes
  );

  // set function to set current swarm
  const setCurrentSwarm = useAppStore((state) => state.setCurrentSwarm);

  // get the current swarm
  useEffect(() => {
    // if there are no bee audio scenes, return
    if (!beeAudioScenes) {
      return;
    }

    // fetch active bees
    sendToServerAndExpectResponseAsync("fetchActiveBees", {}).then((data) => {
      // cast data to an array of bees
      const currentSwarm = data as IBee[];

      // set internal state
      setCurrentSwarm(currentSwarm);

      // initialize the updated bee audio scenes
      const updatedBeeAudioScenes: BeeAudioScene[] = [];

      // loop over the current swarm
      currentSwarm.forEach((bee) => {
        // check if the bee already has an audio scene
        const beeAudioScene = beeAudioScenes.find(
          (audioScene) => audioScene.bee.id === bee.id
        );

        // if the bee has no audio scene, add it to the list
        if (!beeAudioScene) {
          updatedBeeAudioScenes.push({
            bee,
            audioScene: undefined,
            isLooping: false,
          });
        }

        //if the bee has an audio scene, add it to the list
        else {
          updatedBeeAudioScenes.push(beeAudioScene);
        }
      });

      // swap all bee audio scenes
      swapAllBeeAudioScenes(updatedBeeAudioScenes);

      // done loading
      setLoading(false);
    });
  }, []);

  return { loading };
};
