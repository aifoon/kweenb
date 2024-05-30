import { ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { PageSidebar } from "@components/Sidebar";
import { ButtonGroup, Grid, Button, Box, Typography } from "@mui/material";
import { Z3PageContentSidebar } from "@renderer/src/layout";
import { AudioScene } from "@shared/interfaces";
import React, { useEffect } from "react";
import StopIcon from "@mui/icons-material/Stop";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { useBeeStore } from "@renderer/src/hooks";

type AudioTriggerProps = {};

export const AudioTrigger = (props: AudioTriggerProps) => {
  const bees = useBeeStore((state) => state.bees).filter((bee) => bee.isActive);
  const [currentAudioScenes, setCurrentAudioScenes] = React.useState<
    AudioScene[]
  >([]);
  const [currentAudioScene, setCurrentAudioScene] =
    React.useState<AudioScene | null>(null);

  useEffect(() => {
    window.kweenb.methods.getAudioScenes().then((scenes) => {
      setCurrentAudioScenes(scenes);
      if (scenes && scenes.length > 0) setCurrentAudioScene(scenes[0]);
    });
  }, []);

  if (!currentAudioScene)
    return (
      <Box>
        <Typography>
          No scenes can be found. Check if bees are active and online.
        </Typography>
      </Box>
    );

  return (
    <Z3PageContentSidebar
      pageSidebar={
        <PageSidebar
          buttons={currentAudioScenes.map((scene) => (
            <Button
              variant={
                currentAudioScene?.name === scene.name ? "contained" : "text"
              }
              size="small"
              color={"secondary"}
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
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
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
                <Box display={"flex"} gap={1} alignItems={"center"}>
                  <StatusBullet
                    type={
                      bees.find((b) => b.name === bee.name)?.isOnline
                        ? StatusBulletType.Active
                        : StatusBulletType.NotActive
                    }
                    size={8}
                  />{" "}
                  {bee.name}
                </Box>
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
  );
};
