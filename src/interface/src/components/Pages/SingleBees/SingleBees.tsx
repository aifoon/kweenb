import React, { useEffect, useState } from "react";
import { SingleBeeCard } from "../../Cards";
import { Box, Button, ButtonGroup, Grid, Typography } from "@mui/material";
import { useAppStore } from "../../../hooks/useAppStore";
import { useApp } from "../../../hooks/useApp";
import { useAppPersistentStorage } from "../../../hooks/useAppPersistentStorage";
import { IBee, InterfaceComposition } from "@shared/interfaces";
import styled from "styled-components";
import { MasterSlider } from "../../MasterSlider";
import { SaveCompositionAs } from "../../Modals/SaveCompositionAs";
import { Compositions } from "../../Modals/Compositions";

const SingleBeeNavigationBar = styled(Box)`
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 480px) {
    display: grid;
    grid-template-columns: 1fr;
    justify-content: flex-start;
    gap: 1rem;
  }
}`;

const SingleBeeCardContainer = styled(Box)`
  padding-bottom: 75px;
  @media screen and (max-width: 480px) {
    padding-bottom: 175px;
  }
`;

export const SingleBees = () => {
  /**
   * Get the bee audio scenes and selected interface composition from the useAppPersistentStorage hook
   */

  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  const selectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.selectedInterfaceComposition
  );

  /**
   * Inner states
   */

  const masterVolume = useAppStore((state) => state.masterVolume);
  const [currentBees, setCurrentBees] = useState(
    beeAudioScenes?.map((beeAudio) => beeAudio.bee) || []
  );
  const [openSaveCompositionAsModal, setOpenSaveCompositionAsModal] =
    useState(false);
  const [openCompositionsModal, setOpenCompositionsModal] = useState(false);

  /**
   * When the bee audio scenes change, update the current bees
   */

  useEffect(() => {
    setCurrentBees(beeAudioScenes?.map((beeAudio) => beeAudio.bee) || []);
  }, [beeAudioScenes]);

  /**
   * App initialization
   */

  const { loading } = useApp();

  return (
    <>
      <SaveCompositionAs
        open={openSaveCompositionAsModal}
        onClose={() => setOpenSaveCompositionAsModal(false)}
      />
      <Compositions
        open={openCompositionsModal}
        onClose={() => setOpenCompositionsModal(false)}
      />
      <SingleBeeNavigationBar marginBottom={2}>
        <Box>
          {selectedInterfaceComposition && (
            <Typography variant="h5">
              Composition: {selectedInterfaceComposition.name}
            </Typography>
          )}
        </Box>
        <SingleBeeNavigationBar display="flex" gap={1}>
          <Button
            onClick={() => setOpenSaveCompositionAsModal(true)}
            size="small"
            variant="outlined"
            color="secondary"
          >
            Save To New Composition
          </Button>
          <Button
            onClick={() => setOpenCompositionsModal(true)}
            size="small"
            variant="outlined"
            color="secondary"
          >
            Compositions
          </Button>
        </SingleBeeNavigationBar>
      </SingleBeeNavigationBar>
      <SingleBeeCardContainer>
        {!loading && currentBees.length === 0 && (
          <Box>
            <Typography>
              The swarm does not contain bees. Please selected one or more in
              the main kweenb application.
            </Typography>
          </Box>
        )}
        {!loading && currentBees.length > 0 && (
          <Grid container spacing={2}>
            {currentBees.map((bee: IBee) => (
              <Grid key={bee.name} item xs={12} sm={6} md={4} lg={3} xl={2}>
                <SingleBeeCard
                  bee={bee}
                  volume={masterVolume}
                  title={bee.name}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </SingleBeeCardContainer>
      <MasterSlider type="singleBees" />
    </>
  );
};
