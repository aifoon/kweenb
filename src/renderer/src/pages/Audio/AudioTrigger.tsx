import { PageSidebar } from "@components/Sidebar";
import { ButtonGroup, Grid, Button, Box, Typography } from "@mui/material";
import { Z3PageContentSidebar } from "@renderer/src/layout";
import { AudioScene } from "@shared/interfaces";
import React, { useEffect, useState } from "react";
import StopIcon from "@mui/icons-material/Stop";
import { useAppContext, useAppStore, useBeeStore } from "@renderer/src/hooks";

type AudioTriggerProps = {};

export const AudioTrigger = (props: AudioTriggerProps) => {
  const { appContext } = useAppContext();
  const audioScenesCache = useAppStore((state) => state.audioScenesCache);
  const setAudioScenesCache = useAppStore((state) => state.setAudioScenesCache);
  const [currentAudioScene, setCurrentAudioScene] =
    React.useState<AudioScene | null>(null);

  useEffect(() => {
    // set internal useEffect state
    let fetchingAudioScenesForTheFirstTime = false;

    // if there are no cached audio scenes, fetch them
    if (audioScenesCache && audioScenesCache.length === 0) {
      fetchingAudioScenesForTheFirstTime = true;
      appContext.setLoading({
        loading: true,
        text: "Fetching scenes from bees for the first time, this can take a while",
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
      appContext.setLoading({ loading: false });
    });

    return () => {
      canAudioScenesFetchedCauseAReRender = false;
    };
  }, []);

  return (
    <>
      {audioScenesCache && audioScenesCache.length === 0 && (
        <Typography>No scenes discovered on the bees...</Typography>
      )}
      {audioScenesCache && audioScenesCache.length > 0 && (
        <Z3PageContentSidebar
          pageSidebar={
            <PageSidebar
              buttons={audioScenesCache.map((scene) => (
                <Button
                  variant={
                    scene?.name === currentAudioScene?.name
                      ? "contained"
                      : "text"
                  }
                  size="small"
                  color="secondary"
                  style={{ justifyContent: "left" }}
                  key={scene.name}
                  onClick={async () => {
                    setCurrentAudioScene(scene);
                  }}
                >
                  {scene.name}
                </Button>
              ))}
            />
          }
        >
          <Grid container spacing={2}>
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
