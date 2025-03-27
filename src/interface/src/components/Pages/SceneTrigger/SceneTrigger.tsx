import { Box, Button, Grid, Link, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  SelectSceneModal,
  SelectSceneModalType,
} from "../../Modals/SelectScene";
import {
  OrderedAudioScene,
  useAppPersistentStorage,
} from "../../../hooks/useAppPersistentStorage";
import { TriggerSceneCard } from "../../Cards/TriggerSceneCard";
import { useAppStore } from "../../../hooks/useAppStore";
import styled from "styled-components";
import { MasterSlider } from "../../MasterSlider";

type SceneTriggerProps = {};

const SceneTriggerContainer = styled(Box)`
  padding-bottom: 75px;
  @media screen and (max-width: 480px) {
    padding-bottom: 175px;
  }
`;

export const SceneTrigger = (props: SceneTriggerProps) => {
  /**
   * Inner states
   */

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

  const currentSwarm = useAppStore((state) => state.currentSwarm);

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
        onClose={() => setOpenSelectSceneModal(false)}
        open={openSelectSceneModal}
        modalType={SelectSceneModalType.SceneTrigger}
      />
      <Box display="flex" justifyContent="flex-end" marginBottom={2}>
        <Button
          onClick={() => setOpenSelectSceneModal(true)}
          size="small"
          variant="outlined"
          color="secondary"
          disabled={currentSwarm.length === 0}
        >
          Select Scenes
        </Button>
      </Box>
      <SceneTriggerContainer>
        {selectedAudioScenes.length === 0 && (
          <Typography>
            No scenes selected.
            {currentSwarm.length > 0 && (
              <>
                Click{" "}
                <Link onClick={() => setOpenSelectSceneModal(true)}>here</Link>{" "}
                the button above to select scenes.
              </>
            )}
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
      </SceneTriggerContainer>
      <MasterSlider type="sceneTrigger" />
    </>
  );
};
