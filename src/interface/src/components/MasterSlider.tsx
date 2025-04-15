import { NumberSlider } from "@components/Slider";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
} from "@mui/material";
import React, { useState, useEffect } from "react";

import { useAppStore } from "../hooks/useAppStore";
import styled from "styled-components";
import { useAppPersistentStorage } from "../hooks/useAppPersistentStorage";
import { useSocket } from "../hooks/useSocket";
import { PDAudioParam } from "@shared/enums";
import {
  PlayArrow as PlayIcon,
  Loop as LoopIcon,
  VolumeUp as VolumeUpIcon,
  Stop as StopIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

type MasterSliderProps = {
  type?: "singleBees" | "sceneTrigger";
};

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
    padding: 15px 15px 15px 15px;
  }
`;

const MasterSliderGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  width: 100%;
  gap: 10px;
  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(2, 1fr);
    gap: 2;
    width: 100%;
  }
`;

export const MasterSlider = ({ type = "singleBees" }: MasterSliderProps) => {
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

  const removeAllAudioScenes = useAppPersistentStorage(
    (state) => state.removeAllAudioScenes
  );

  const setSelectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.setSelectedInterfaceComposition
  );

  const selectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.selectedInterfaceComposition
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
  const removeAllBeeAudioScenes = () => {
    const bees = beeAudioScenes.map((beeAudioScene) => {
      return beeAudioScene.bee;
    });
    sendToServerWithoutResponse("stopAudio", {
      bees,
    });
    removeAllAudioScenes();
    setSelectedInterfaceComposition(undefined);
  };

  const setAllBeesToLoopingState = (isLooping: boolean) => {
    // 1. Update local component state
    setOneOrMoreBeesAreLooping(isLooping);

    // 2. Send update to server for all bees in the swarm
    sendToServerWithoutResponse("setParamOfBees", {
      type: PDAudioParam.FILE_LOOP,
      value: isLooping,
      bees: currentSwarm,
    });

    // 3. Update all bee audio scenes with new looping state
    const updatedBeeAudioScenes = beeAudioScenes.map((beeAudioScene) => ({
      ...beeAudioScene,
      isLooping,
    }));

    // 4. Update the state with the modified scenes
    swapAllBeeAudioScenes(updatedBeeAudioScenes);

    // 5. If there's a selected composition, update its bee looping states on the server
    if (selectedInterfaceComposition) {
      const updatedBeeAudioScenesWithAudioScene = updatedBeeAudioScenes.filter(
        (beeAudioScene) => beeAudioScene.audioScene !== undefined
      );
      sendToServerWithoutResponse(
        "updateMultipleInterfaceCompositionBeeLooping",
        {
          interfaceCompositions: updatedBeeAudioScenesWithAudioScene.map(
            (beeAudioScene) => ({
              interfaceCompositionId: selectedInterfaceComposition.id,
              beeId: beeAudioScene.bee.id,
              isLooping,
            })
          ),
        }
      );
    }
  };

  const setParamOfBees = (value: number, type: PDAudioParam) => {
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
  };

  const startAudio = () => {
    sendToServerWithoutResponse("startAudioMultiple", {
      data: beeAudioScenes
        .filter((beeAudioScene) => {
          return beeAudioScene.audioScene !== undefined;
        })
        .map((beeAudioScene) => {
          return {
            scene: beeAudioScene.audioScene,
            bee: beeAudioScene.bee,
          };
        }),
    });
  };

  const stopAudio = () => {
    sendToServerWithoutResponse("stopAudio", {
      bees: currentSwarm,
    });
  };

  const paramUp = () => {
    const maxValue = selectedPDAudioParam === PDAudioParam.VOLUME ? 100 : 2;
    const increment = selectedPDAudioParam === PDAudioParam.VOLUME ? 1 : 0.1;
    const newValue = Math.min(sliderValue + increment, maxValue);
    setSliderValue(newValue);
    setParamOfBees(newValue, selectedPDAudioParam);
  };

  const paramDown = () => {
    const minValue = selectedPDAudioParam === PDAudioParam.VOLUME ? 0 : 0.1;
    const decrement = selectedPDAudioParam === PDAudioParam.VOLUME ? 1 : 0.1;
    console.log("decrement", decrement);
    const newValue = Math.max(sliderValue - decrement, minValue);
    setSliderValue(newValue);
    setParamOfBees(newValue, selectedPDAudioParam);
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
          <Box
            sx={{ padding: "0 0 0 10px" }}
            display={"grid"}
            gap={2}
            gridTemplateColumns={"1fr 100px"}
            alignItems={"center"}
          >
            <NumberSlider
              step={selectedPDAudioParam === "volume" ? 1 : 0.1}
              min={0}
              max={selectedPDAudioParam === "volume" ? 100 : 2}
              showNumber={false}
              value={sliderValue}
              marginBottom="0"
              onChangeCommitted={(value) => {
                setSliderValue(value);
                setParamOfBees(value, selectedPDAudioParam);
              }}
            />
            <Box
              display={"grid"}
              justifyContent={"flex-end"}
              gridTemplateColumns={"repeat(2, 1fr)"}
              gap={1}
            >
              <Button
                sx={{ minWidth: "auto" }}
                color="secondary"
                variant="outlined"
                size="small"
                onClick={paramDown}
              >
                <RemoveIcon />
              </Button>
              <Button
                sx={{ minWidth: "auto" }}
                color="secondary"
                variant="outlined"
                size="small"
                onClick={paramUp}
              >
                <AddIcon />
              </Button>
            </Box>
          </Box>
          <Box display="grid" gap={1} gridTemplateColumns="1fr 1fr">
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
            <Box display="grid" gridTemplateColumns={"1fr 0.5fr 0.5fr"} gap={1}>
              {/* On the single bees page */}
              {type === "singleBees" && (
                <ButtonGroup>
                  <Button
                    sx={{ minWidth: "auto" }}
                    fullWidth={true}
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={startAudio}
                  >
                    <PlayIcon />
                  </Button>
                  <Box
                    sx={{
                      width: "1px",
                      backgroundColor: "var(--primary-300)",
                      margin: "0 2px",
                    }}
                  />
                  <Button
                    sx={{ minWidth: "auto" }}
                    fullWidth={true}
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={stopAudio}
                  >
                    <StopIcon />
                  </Button>
                </ButtonGroup>
              )}
              {/* On the scene trigger page */}
              {type === "sceneTrigger" && (
                <Button
                  sx={{ minWidth: "auto" }}
                  fullWidth={true}
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={stopAudio}
                >
                  <StopIcon />
                </Button>
              )}
              <Button
                sx={{ minWidth: "auto" }}
                fullWidth={true}
                size="small"
                variant={oneOrMoreBeesAreLooping ? "contained" : "outlined"}
                color={oneOrMoreBeesAreLooping ? "primary" : "secondary"}
                onClick={() => {
                  setAllBeesToLoopingState(!oneOrMoreBeesAreLooping);
                }}
              >
                <LoopIcon />
              </Button>
              <Button
                sx={{ minWidth: "auto" }}
                color="secondary"
                variant="outlined"
                size="small"
                fullWidth={true}
                onClick={removeAllBeeAudioScenes}
              >
                <ClearIcon />
              </Button>
            </Box>
          </Box>
        </MasterSliderGrid>
      </MasterSliderInnerContainer>
    </MasterSliderContainer>
  );
};
