import React, { useEffect, useState } from "react";
import { SingleBeeCard } from "../../Cards";
import { Box, Grid } from "@mui/material";
import { useAppStore } from "../../../hooks/useAppStore";
import { useApp } from "../../../hooks/useApp";
import { useAppPersistentStorage } from "../../../hooks/useAppPersistentStorage";
import { IBee } from "@shared/interfaces";
import styled from "styled-components";

const SingleBeeCardContainer = styled(Box)`
  padding-bottom: 75px;
  @media screen and (max-width: 480px) {
    padding-bottom: 175px;
  }
`;

export const SingleBees = () => {
  // get the master volume of the app store
  const masterVolume = useAppStore((state) => state.masterVolume);

  // get the saved bee audio scenes
  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  // get the bees
  const [currentBees, setCurrentBees] = useState(
    beeAudioScenes?.map((beeAudio) => beeAudio.bee) || []
  );

  useEffect(() => {
    setCurrentBees(beeAudioScenes?.map((beeAudio) => beeAudio.bee) || []);
  }, [beeAudioScenes]);

  // this hook inits the application page
  useApp();

  return (
    <SingleBeeCardContainer>
      <Grid container spacing={2}>
        {currentBees.map((bee: IBee) => (
          <Grid key={bee.name} item xs={12} sm={6} md={4} lg={3} xl={2}>
            <SingleBeeCard bee={bee} volume={masterVolume} title={bee.name} />
          </Grid>
        ))}
      </Grid>
    </SingleBeeCardContainer>
  );
};
