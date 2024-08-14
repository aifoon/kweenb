import React, { useEffect, useState } from "react";
import { SingleBeeCard } from "../../Cards";
import { Box, Grid, Typography } from "@mui/material";
import { useAppStore } from "../../../hooks/useAppStore";
import { useApp } from "../../../hooks/useApp";
import { useAppPersistentStorage } from "../../../hooks/useAppPersistentStorage";
import { IBee } from "@shared/interfaces";
import styled from "styled-components";
import { Loader } from "@components/Loader";

const SingleBeeCardContainer = styled(Box)`
  padding-bottom: 75px;
  @media screen and (max-width: 480px) {
    padding-bottom: 175px;
  }
`;

export const SingleBees = () => {
  /**
   * Get the bee audio scenesfrom the useAppPersistentStorage hook
   */

  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  /**
   * Inner states
   */

  const masterVolume = useAppStore((state) => state.masterVolume);
  const [currentBees, setCurrentBees] = useState(
    beeAudioScenes?.map((beeAudio) => beeAudio.bee) || []
  );

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
    <SingleBeeCardContainer>
      {!loading && currentBees.length === 0 && (
        <Box>
          <Typography>
            The swarm does not contain bees. Please selected one or more in the
            main kweenb application.
          </Typography>
        </Box>
      )}
      {!loading && currentBees.length > 0 && (
        <Grid container spacing={2}>
          {currentBees.map((bee: IBee) => (
            <Grid key={bee.name} item xs={12} sm={6} md={4} lg={3} xl={2}>
              <SingleBeeCard bee={bee} volume={masterVolume} title={bee.name} />
            </Grid>
          ))}
        </Grid>
      )}
    </SingleBeeCardContainer>
  );
};
