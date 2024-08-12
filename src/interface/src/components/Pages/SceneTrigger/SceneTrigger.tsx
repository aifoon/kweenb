import { Box, Button, Grid, Link, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SelectSceneModal } from "../../Modals/SelectScene";
import {
  OrderedAudioScene,
  useAppPersistentStorage,
} from "../../../hooks/useAppPersistentStorage";
import { AudioScene } from "@shared/interfaces";
import { TriggerSceneCard } from "../../Cards/TriggerSceneCard";

type SceneTriggerProps = {};

export const SceneTrigger = (props: SceneTriggerProps) => {
  const [openSelectSceneModal, setOpenSelectSceneModal] = useState(false);
  const [selectedAudioScenes, setSelectedAudioScenes] = useState<
    OrderedAudioScene[]
  >([]);

  /**
   * Get the ordered audio scenes from the useAppPersistentStorage hook
   */

  const orderedAudioScenes = useAppPersistentStorage(
    (state) => state.orderedAudioScenes
  );

  /**
   * When the ordered audio scenes change, sort them by order and set the selected audio scenes
   */

  useEffect(() => {
    setSelectedAudioScenes(
      orderedAudioScenes.sort((a, b) => a.order - b.order)
    );
  }, [orderedAudioScenes]);

  return (
    <>
      <SelectSceneModal
        open={openSelectSceneModal}
        onClose={() => setOpenSelectSceneModal(false)}
      />
      <Box display="flex" justifyContent="flex-end" marginBottom={2}>
        <Button
          onClick={() => setOpenSelectSceneModal(true)}
          size="small"
          variant="outlined"
          color="secondary"
        >
          Select Scenes
        </Button>
      </Box>
      <Box style={{ paddingBottom: "75px" }}>
        {selectedAudioScenes.length === 0 && (
          <Typography>
            No scenes selected. Click{" "}
            <Link onClick={() => setOpenSelectSceneModal(true)}>here</Link> the
            button above to select scenes.
          </Typography>
        )}
        {selectedAudioScenes.length > 0 && (
          <Grid container spacing={2}>
            {orderedAudioScenes.map(
              (orderedAudioScene: OrderedAudioScene, index) => {
                return (
                  <Grid
                    key={orderedAudioScene.audioScene.name}
                    item
                    xs={12}
                    sm={4}
                    md={3}
                    lg={2}
                    xl={2}
                  >
                    <TriggerSceneCard
                      isLast={index === orderedAudioScenes.length - 1}
                      isFirst={index === 0}
                      orderedAudioScene={orderedAudioScene}
                    />
                  </Grid>
                );
              }
            )}
          </Grid>
        )}
      </Box>
    </>
  );
};
