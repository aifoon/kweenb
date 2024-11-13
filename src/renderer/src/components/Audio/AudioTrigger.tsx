import { PageSidebar } from "@components/Sidebar";
import { ButtonGroup, Grid, Button, Box, Typography } from "@mui/material";
import { Z3PageContentSidebar } from "@components/Layout";
import { AudioScene } from "@shared/interfaces";
import React, { useEffect } from "react";
import StopIcon from "@mui/icons-material/Stop";
import { useAppStore } from "@renderer/src/hooks";
import {
  SimpleTreeviewSidebar,
  SimpleTreeviewSidebarData,
} from "@components/Sidebar/SimpleTreeviewSidebar";
import { TreeItem } from "@mui/x-tree-view";

type AddProperty<T, K extends string, V> = T & { [P in K]: V };

interface AudioSceneFolder {
  label: string;
  folders: AudioSceneFolder[];
  audioScenes: AddProperty<AudioScene, "label", string>[];
}

type AudioTriggerProps = {};

/**
 * Builds Audio Scene Tree
 * @param scenes
 * @returns
 */
function buildAudioSceneTree(scenes: AudioScene[]): AudioSceneFolder {
  // Initialize root folder
  const rootFolder: AudioSceneFolder = {
    label: "Root",
    folders: [],
    audioScenes: [],
  };

  scenes.forEach((scene) => {
    // Split the scene name by "_" to determine the hierarchy
    const parts = scene.name.split("_");
    let currentFolder = rootFolder;

    // Traverse or build folders based on parts, except the last part
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];

      // Check if folder already exists at this level
      let existingFolder = currentFolder.folders.find(
        (folder) => folder.label === part
      );

      // If folder doesn't exist, create it
      if (!existingFolder) {
        existingFolder = { label: part, folders: [], audioScenes: [] };
        currentFolder.folders.push(existingFolder);
      }

      // Move down to the next level in the hierarchy
      currentFolder = existingFolder;
    }

    // Add the final part as an audioScene in the correct folder
    currentFolder.audioScenes.push({
      ...scene,
      label: parts[parts.length - 1],
    });
  });

  return rootFolder;
}

export const AudioTrigger = (props: AudioTriggerProps) => {
  const setLoading = useAppStore((state) => state.setLoading);

  const audioScenesCache = useAppStore((state) => state.audioScenesCache);
  const setAudioScenesCache = useAppStore((state) => state.setAudioScenesCache);
  const [currentAudioScene, setCurrentAudioScene] =
    React.useState<AudioScene | null>(null);
  const [audioSceneTree, setAudioSceneTree] =
    React.useState<AudioSceneFolder | null>(null);

  /**
   * When the component mounts, fetch the audio scenes
   */
  useEffect(() => {
    // set internal useEffect state
    let fetchingAudioScenesForTheFirstTime = false;

    // if there are no cached audio scenes, fetch them
    if (audioScenesCache && audioScenesCache.length === 0) {
      fetchingAudioScenesForTheFirstTime = true;
      setLoading({
        loading: true,
        text: "Fetching scenes from bees for the first time, this can take a while",
        cancelButton: true,
        onCancel: () => {
          console.log("cancelling");
        },
      });
    }

    // there are scenes, add the first cached one
    else {
      setCurrentAudioScene(audioScenesCache[0]);
    }

    // set an internal variable to check if new settings can be fetched
    let canAudioScenesFetchedCauseAReRender = true;

    // always fetch new scenes, we want to perform at best value
    window.kweenb.methods.getAudioScenes().then((scenes) => {
      if (!canAudioScenesFetchedCauseAReRender) return;

      // always sort the scenes by name
      scenes.sort((a, b) => a.name.localeCompare(b.name));

      // set the store cache
      setAudioScenesCache(scenes);
      setAudioSceneTree(buildAudioSceneTree(scenes));

      // if we are fetching for the first time, set the current scene to the first one
      if (fetchingAudioScenesForTheFirstTime) {
        fetchingAudioScenesForTheFirstTime = false;
        setCurrentAudioScene(scenes[0]);
      }

      // when we are not fetching for the first time, we want to keep the current scene
      setCurrentAudioScene((current) => {
        if (!current) return scenes[0];
        return scenes.find((scene) => scene.name === current.name) || scenes[0];
      });

      // close losding box
      setLoading({ loading: false });
    });

    return () => {
      canAudioScenesFetchedCauseAReRender = false;
    };
  }, []);

  /**
   * Converts Audio Scene Tree to Simple Treeview Sidebar Data
   * @param folder
   * @param currentAudioScene
   * @param setCurrentAudioScene
   * @returns
   */
  function convertToSimpleTreeviewSidebarData(
    folder: AudioSceneFolder
  ): SimpleTreeviewSidebarData {
    // Map each audio scene in the folder to a button
    const items = folder.audioScenes.map((scene) => ({
      label: scene.label,
      treeItem: (
        <TreeItem
          key={scene.name}
          itemId={scene.name}
          label={scene.label}
          onClick={() => {
            setCurrentAudioScene(scene);
          }}
        />
      ),
    }));

    // Recursively process any nested folders
    const treeviewSidebarData = folder.folders.map((subFolder) =>
      convertToSimpleTreeviewSidebarData(subFolder)
    );

    // Return the structured data for this level, including nested folders
    return {
      label: folder.label,
      items,
      folders: treeviewSidebarData,
    };
  }

  return (
    <>
      {audioScenesCache && audioScenesCache.length === 0 && (
        <Typography>No scenes discovered on the bees...</Typography>
      )}
      {audioScenesCache && audioScenesCache.length > 0 && (
        <Z3PageContentSidebar
          sidebar={
            <SimpleTreeviewSidebar
              filterButtons
              treeviewSidebarData={
                (audioSceneTree &&
                  convertToSimpleTreeviewSidebarData(audioSceneTree)) ||
                null
              }
            />
          }
        >
          <Grid
            container
            spacing={1}
            style={{
              position: "sticky",
              top: "calc(var(--navigationHeight) + 1rem)",
            }}
          >
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
              <ButtonGroup fullWidth>
                <Button
                  onClick={() => {
                    if (currentAudioScene?.foundOnBees) {
                      window.kweenb.methods.startAudio(
                        currentAudioScene?.foundOnBees,
                        currentAudioScene?.oscAddress
                      );
                    }
                  }}
                  variant="contained"
                  color="primary"
                >
                  All
                </Button>
                <Button
                  onClick={() => {
                    if (currentAudioScene?.foundOnBees) {
                      window.kweenb.methods.stopAudio(
                        currentAudioScene?.foundOnBees
                      );
                    }
                  }}
                  style={{ width: "20%" }}
                  variant="contained"
                  size="small"
                  color="secondary"
                >
                  <StopIcon />
                </Button>
              </ButtonGroup>
            </Grid>
            {currentAudioScene?.foundOnBees.map((bee) => (
              <Grid
                key={`control_bee_${bee.id}`}
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={2}
              >
                <ButtonGroup fullWidth>
                  <Button
                    onClick={() =>
                      window.kweenb.methods.startAudio(
                        bee,
                        currentAudioScene.oscAddress
                      )
                    }
                    variant="contained"
                    color="primary"
                  >
                    {bee.name}
                  </Button>
                  <Button
                    onClick={() => window.kweenb.methods.stopAudio(bee)}
                    style={{ width: "20%" }}
                    variant="contained"
                    size="small"
                    color="secondary"
                  >
                    <StopIcon />
                  </Button>
                </ButtonGroup>
              </Grid>
            ))}
          </Grid>
        </Z3PageContentSidebar>
      )}
    </>
  );
};
