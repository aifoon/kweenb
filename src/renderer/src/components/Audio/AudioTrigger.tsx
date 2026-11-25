import { ButtonGroup, Grid, Button, Typography } from "@mui/material";
import { Z3PageContentSidebar } from "@components/Layout";
import { AudioScene } from "@shared/interfaces";
import React, { useEffect } from "react";
import StopIcon from "@mui/icons-material/Stop";
import { useAppStore, useBeeStore } from "@renderer/src/hooks";
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

// a button that cannot be used stays readable on the dark background
const offlineButtonStyle = {
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
};

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
      // (capitals make no difference: "Walk" and "walk" are one folder,
      // shown the way it was written first)
      let existingFolder = currentFolder.folders.find(
        (folder) => folder.label.toLowerCase() === part.toLowerCase()
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

  const audioScenes = useAppStore((state) => state.audioScenes);
  const setAudioScenes = useAppStore((state) => state.setAudioScenes);
  const [currentAudioScene, setCurrentAudioScene] =
    React.useState<AudioScene | null>(null);
  const [audioSceneTree, setAudioSceneTree] =
    React.useState<AudioSceneFolder | null>(null);

  // the bees that are online right now: KweenB remembers the scenes of a
  // bee that is switched off, but such a bee cannot play
  const bees = useBeeStore((state) => state.bees);
  const isOnline = (beeId: number) =>
    bees.some((bee) => bee.id === beeId && bee.isOnline);
  const onlineBeesOfScene = (currentAudioScene?.foundOnBees || []).filter(
    (bee) => isOnline(bee.id)
  );

  /**
   * When the component mounts, fetch the audio scenes
   */
  useEffect(() => {
    setLoading({
      loading: true,
      text: "Fetching scenes from bees...",
      cancelButton: true,
      onCancel: () => {
        console.log("cancelling");
      },
    });

    // always fetch new scenes, we want to perform at best value
    window.kweenb.methods.getAudioScenes().then((scenes) => {
      // always sort the scenes by name
      scenes.sort((a, b) => a.name.localeCompare(b.name));

      // set the store cache
      setAudioScenes(scenes);
      setAudioSceneTree(buildAudioSceneTree(scenes));

      // when we are not fetching for the first time, we want to keep the current scene
      setCurrentAudioScene((current) => {
        if (!current) return scenes[0];
        return scenes.find((scene) => scene.name === current.name) || scenes[0];
      });

      // close losding box
      setLoading({ loading: false });
    });
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
      {audioScenes && audioScenes.length === 0 && (
        <Typography>No scenes discovered on the bees...</Typography>
      )}
      {audioScenes && audioScenes.length > 0 && (
        <Z3PageContentSidebar
          sidebar={
            <SimpleTreeviewSidebar
              filterButtons
              noItemsText="No audio scenes found"
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
              <ButtonGroup
                fullWidth
                sx={{ "& .MuiButton-root": offlineButtonStyle }}
              >
                <Button
                  disabled={onlineBeesOfScene.length === 0}
                  onClick={() => {
                    if (currentAudioScene)
                      window.kweenb.methods.startAudio(
                        onlineBeesOfScene,
                        currentAudioScene.oscAddress
                      );
                  }}
                  variant="contained"
                  color="primary"
                >
                  All
                </Button>
                <Button
                  disabled={onlineBeesOfScene.length === 0}
                  onClick={() => {
                    window.kweenb.methods.stopAudio(onlineBeesOfScene);
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
            {[...(currentAudioScene?.foundOnBees || [])]
              .sort((a, b) => a.id - b.id)
              .map((bee) => (
                <Grid
                  key={`control_bee_${bee.id}`}
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  xl={2}
                >
                  <ButtonGroup
                    fullWidth
                    sx={{ "& .MuiButton-root": offlineButtonStyle }}
                  >
                    <Button
                      disabled={!isOnline(bee.id)}
                      onClick={() =>
                        currentAudioScene &&
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
                      disabled={!isOnline(bee.id)}
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
