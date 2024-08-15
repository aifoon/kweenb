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
import { PDAudioParam } from "@shared/enums";

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
  /**
   * Get the states and functions from the useAppStore hook
   */

  const masterVolume = useAppStore((state) => state.masterVolume);
  const masterLow = useAppStore((state) => state.masterLow);
  const masterHigh = useAppStore((state) => state.masterHigh);
  const setMasterVolume = useAppStore((state) => state.setMasterVolume);
  const setMasterLow = useAppStore((state) => state.setMasterLow);
  const setMasterHigh = useAppStore((state) => state.setMasterHigh);
  const currentSwarm = useAppStore((state) => state.currentSwarm);

  /**
   * Web socket
   */

  const { sendToServerWithoutResponse } = useSocket();

  /**
   * Get states and functions from the useAppPersistentStorage hook
   */

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

  /**
   * Inner states
   */

  const [selectedPDAudioParam, setSelectedPDAudioParam] =
    useState<PDAudioParam>(PDAudioParam.VOLUME);
  const [sliderValue, setSliderValue] = useState(masterVolume);

  /**
   * Reusable function to set all bees to looping state
   */
  const setAllBeesToLoopingState = (isLooping: boolean) => {
    const updatedBeeAudioScenes = beeAudioScenes.map((beeAudioScene) => {
      return {
        ...beeAudioScene,
        isLooping,
      };
    });
    swapAllBeeAudioScenes(updatedBeeAudioScenes);
  };

  /**
   * When the bee audio scenes change, update the looping state
   */

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
              step={selectedPDAudioParam === "volume" ? 1 : 0.1}
              min={0}
              max={selectedPDAudioParam === "volume" ? 100 : 2}
              showNumber={false}
              value={sliderValue}
              marginBottom="0"
              onChangeCommitted={(value) => {
                setSliderValue(value);
                sendToServerWithoutResponse("setParamOfBees", {
                  type: selectedPDAudioParam,
                  value,
                  bees: currentSwarm,
                });
                switch (selectedPDAudioParam) {
                  case PDAudioParam.VOLUME:
                    setMasterVolume(value);
                    break;
                  case PDAudioParam.LOW:
                    setMasterLow(value);
                    break;
                  case PDAudioParam.HIGH:
                    setMasterHigh(value);
                    break;
                  default:
                    setMasterVolume(value);
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
              value={selectedPDAudioParam}
              exclusive={true}
              onChange={(event, newValue) => {
                setSelectedPDAudioParam(newValue);
                switch (newValue) {
                  case PDAudioParam.VOLUME:
                    setSliderValue(masterVolume);
                    break;
                  case PDAudioParam.LOW:
                    setSliderValue(masterLow);
                    break;
                  case PDAudioParam.HIGH:
                    setSliderValue(masterHigh);
                    break;
                  default:
                    setSliderValue(masterVolume);
                    break;
                }
              }}
            >
              <ToggleButton
                value={PDAudioParam.VOLUME}
                aria-label="left aligned"
              >
                <VolumeUpIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value={PDAudioParam.LOW} aria-label="left aligned">
                LOW
              </ToggleButton>
              <ToggleButton value={PDAudioParam.HIGH} aria-label="left aligned">
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
                    type: PDAudioParam.FILE_LOOP,
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
