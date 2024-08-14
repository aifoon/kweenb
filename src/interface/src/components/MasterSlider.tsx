import { NumberSlider } from "@components/Slider";
import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { useAppStore } from "../hooks/useAppStore";
import StopIcon from "@mui/icons-material/Stop";
import styled from "styled-components";
import LoopIcon from "@mui/icons-material/Loop";
import { useAppPersistentStorage } from "../hooks/useAppPersistentStorage";
import { useSocket } from "../hooks/useSocket";

type MasterSliderProps = {};

const MasterSliderContainer = styled(Box)`
  display: flex;
  position: fixed;
  left: calc(var(--contentPaddingLeft) * 2);
  bottom: 40px;
  width: calc(100vw - var(--contentPaddingLeft) * 4);
  @media screen and (max-width: 480px) {
    left: var(--contentPaddingMobileLeft);
    width: calc(100vw - var(--contentPaddingMobileLeft) * 2);
  }
`;

const MasterSliderInnerContainer = styled(Box)`
  background-color: var(--primary-300);
  border-radius: 10px;
  border: 1px solid var(--grey-300);
  padding: 7px 15px;
  width: 100%;
  @media screen and (max-width: 480px) {
    padding: 7px 15px 15px 15px;
  }
`;

const MasterSliderGrid = styled(Box)`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;
  width: 100%;
  gap: 24px;
  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(2, 1fr);
    gap: 0;
    width: 100%;
  }
`;

export const MasterSlider = (props: MasterSliderProps) => {
  // the store states and actions
  const masterVolume = useAppStore((state) => state.masterVolume);
  const masterLow = useAppStore((state) => state.masterLow);
  const masterHigh = useAppStore((state) => state.masterHigh);
  const setMasterVolume = useAppStore((state) => state.setMasterVolume);
  const setMasterLow = useAppStore((state) => state.setMasterLow);
  const setMasterHigh = useAppStore((state) => state.setMasterHigh);
  const currentSwarm = useAppStore((state) => state.currentSwarm);
  const { sendToServerWithoutResponse } = useSocket();

  // get the saved bee audio scenes
  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  const swapAllBeeAudioScenes = useAppPersistentStorage(
    (state) => state.swapAllBeeAudioScenes
  );

  // set the looping state
  const [oneOrMoreBeesAreLooping, setOneOrMoreBeesAreLooping] = useState(
    beeAudioScenes.some((beeAudioScene) => beeAudioScene.isLooping)
  );

  // the internal states
  const [selectedProperty, setSelectedProperty] = useState("volume");
  const [sliderValue, setSliderValue] = useState(masterVolume);

  // set all the bee audio scenes to non looping
  const setAllBeesToLoopingState = (isLooping: boolean) => {
    const updatedBeeAudioScenes = beeAudioScenes.map((beeAudioScene) => {
      return {
        ...beeAudioScene,
        isLooping,
      };
    });
    swapAllBeeAudioScenes(updatedBeeAudioScenes);
  };

  useEffect(() => {
    setOneOrMoreBeesAreLooping(
      beeAudioScenes.some((beeAudio) => beeAudio.isLooping)
    );
  }, [beeAudioScenes]);

  return (
    <MasterSliderContainer paddingTop={3}>
      <MasterSliderInnerContainer>
        <MasterSliderGrid alignItems="center">
          <Box sx={{ padding: "0px 10px" }}>
            <NumberSlider
              showNumber={false}
              value={sliderValue}
              marginBottom="0"
              onChangeCommitted={(value) => {
                switch (selectedProperty) {
                  case "volume":
                    setSliderValue(value);
                    setMasterVolume(value);
                    sendToServerWithoutResponse("setParamOfBees", {
                      type: "volume",
                      value,
                      bees: currentSwarm,
                    });
                    break;
                  case "low":
                    setSliderValue(value);
                    setMasterLow(value);
                    sendToServerWithoutResponse("setParamOfBees", {
                      type: "low",
                      value,
                      bees: currentSwarm,
                    });
                    break;
                  case "high":
                    setSliderValue(value);
                    setMasterHigh(value);
                    sendToServerWithoutResponse("setParamOfBees", {
                      type: "high",
                      value,
                      bees: currentSwarm,
                    });
                    break;
                  default:
                    setSliderValue(value);
                    setMasterVolume(value);
                    sendToServerWithoutResponse("setParamOfBees", {
                      type: "volume",
                      value,
                      bees: currentSwarm,
                    });
                    break;
                }
              }}
            />
          </Box>
          <Box display={"grid"} gap={1} gridTemplateColumns="1fr 1fr">
            <ToggleButtonGroup
              fullWidth={true}
              size="small"
              aria-label="Small sizes"
              value={selectedProperty}
              exclusive={true}
              onChange={(event, newValue) => {
                setSelectedProperty(newValue);
                switch (newValue) {
                  case "volume":
                    setSliderValue(masterVolume);
                    break;
                  case "low":
                    setSliderValue(masterLow);
                    break;
                  case "high":
                    setSliderValue(masterHigh);
                    break;
                  default:
                    setSliderValue(masterVolume);
                    break;
                }
              }}
            >
              <ToggleButton value="volume" aria-label="left aligned">
                <VolumeUpIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="low" aria-label="left aligned">
                LOW
              </ToggleButton>
              <ToggleButton value="high" aria-label="left aligned">
                HIGH
              </ToggleButton>
            </ToggleButtonGroup>
            <Box display="flex" gap={1} maxWidth="100%">
              <Button
                sx={{ padding: 0, minWidth: "auto" }}
                fullWidth={true}
                security="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  sendToServerWithoutResponse("stopAudio", {
                    bees: currentSwarm,
                  });
                }}
              >
                <StopIcon />
              </Button>
              <Button
                sx={{ padding: 0, minWidth: "auto" }}
                fullWidth={true}
                size="small"
                variant={oneOrMoreBeesAreLooping ? "contained" : "outlined"}
                color={oneOrMoreBeesAreLooping ? "primary" : "secondary"}
                onClick={() => {
                  sendToServerWithoutResponse("setParamOfBees", {
                    type: "fileLoop",
                    value: !oneOrMoreBeesAreLooping,
                    bees: currentSwarm,
                  });
                  setAllBeesToLoopingState(!oneOrMoreBeesAreLooping);
                  setOneOrMoreBeesAreLooping(!oneOrMoreBeesAreLooping);
                }}
              >
                <LoopIcon />
              </Button>
            </Box>
          </Box>
        </MasterSliderGrid>
      </MasterSliderInnerContainer>
    </MasterSliderContainer>
  );
};
