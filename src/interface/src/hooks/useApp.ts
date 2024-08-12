import React, { useState, useEffect } from "react";
import {
  BeeAudioScene,
  useAppPersistentStorage,
} from "./useAppPersistentStorage";
import { demoSwarm } from "../seeds/demoSwarm";

export const useApp = () => {
  // get the saved bee audio scenes
  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  // get the saved bee audio scenes
  const swapAllBeeAudioScenes = useAppPersistentStorage(
    (state) => state.swapAllBeeAudioScenes
  );

  // get the current swarm
  useEffect(() => {
    // if there are no bee audio scenes, return
    if (!beeAudioScenes) {
      return;
    }

    // get the current swarm
    const currentSwarm = demoSwarm;

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
        updatedBeeAudioScenes.push({ bee, audioScene: undefined });
      }

      //if the bee has an audio scene, add it to the list
      else {
        updatedBeeAudioScenes.push(beeAudioScene);
      }
    });
    // swap all bee audio scenes
    swapAllBeeAudioScenes(updatedBeeAudioScenes);
  }, []);
};
