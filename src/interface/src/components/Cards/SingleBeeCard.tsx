import React, { useEffect, useState } from "react";
import { Card } from "@components/Cards/Card";
import { NumberSlider } from "@components/Slider";
import { Box, Button, Typography } from "@mui/material";
import { SelectSceneModal, SelectSceneModalType } from "../Modals/SelectScene";
import { useAppPersistentStorage } from "../../hooks/useAppPersistentStorage";
import { AudioScene, IBee, BeeAudioScene } from "@shared/interfaces";
import { useSocket } from "../../hooks/useSocket";
import { PDAudioParam } from "@shared/enums";

import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Loop as LoopIcon,
  Folder as FolderIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  PlaylistRemove as PlaylistRemoveIcon,
} from "@mui/icons-material";

type SingleBeeCardProps = {
  bee: IBee;
  title?: string;
  volume?: number;
  isLooping?: boolean;
};

export const SingleBeeCard = ({
  bee,
  title = "",
  volume = 50,
  isLooping = false,
}: SingleBeeCardProps) => {
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [openSelectSceneModal, setOpenSelectSceneModal] = useState(false);
  const [, setSelectedBeeAudioScene] = useState<BeeAudioScene | undefined>(
    undefined
  );
  const [selectedAudioScene, setSelectedAudioScene] = useState<
    AudioScene | undefined
  >(undefined);

  const { sendToServerWithoutResponse } = useSocket();

  /**
   * Get states and functions from the useAppPersistentStorage hook
   */

  const beeAudioScene = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  ).find((beeAudio) => beeAudio.bee.id === bee.id);

  const updateBeeAudioScene = useAppPersistentStorage(
    (state) => state.updateBeeAudioScene
  );

  const removeBeeAudioScene = useAppPersistentStorage(
    (state) => state.removeBeeAudioScene
  );

  const selectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.selectedInterfaceComposition
  );

  /**
   * Reusable functions
   */

  const clearAudioScene = () => {
    // Stop the audio
    sendToServerWithoutResponse("stopAudio", {
      bees: [bee],
    });

    // Remove the bee audio scene
    removeBeeAudioScene(bee);

    // Update the interface composition
    if (selectedInterfaceComposition) {
      // Update the server
      sendToServerWithoutResponse("deleteInterfaceCompositionBee", {
        interfaceCompositionId: selectedInterfaceComposition.id,
        beeId: bee.id,
      });
    }
  };

  const setParamOfBees = (value: number, type: PDAudioParam) => {
    setCurrentVolume(value);
    sendToServerWithoutResponse("setParamOfBees", {
      value,
      type: PDAudioParam.VOLUME,
      bees: [bee],
    });
  };

  const updateBeeLooping = (value: boolean) => {
    // let the server know what to do
    sendToServerWithoutResponse("setParamOfBees", {
      value,
      type: PDAudioParam.FILE_LOOP,
      bees: [bee],
    });

    // state management
    updateBeeAudioScene(bee, selectedAudioScene, value);

    // if we have a selected interface composition, update the looping state in the database
    if (selectedInterfaceComposition) {
      sendToServerWithoutResponse("updateInterfaceCompositionBeeLooping", {
        interfaceCompositionId: selectedInterfaceComposition.id,
        beeId: bee.id,
        isLooping: value,
      });
    }
  };

  const setCurrenVolume = (value: number) => {
    setCurrentVolume(value);
    setParamOfBees(value, PDAudioParam.VOLUME);
  };

  const startAudio = () => {
    if (selectedAudioScene) {
      sendToServerWithoutResponse("startAudio", {
        scene: selectedAudioScene,
        bees: [bee],
      });
    }
  };

  const stopAudio = () => {
    sendToServerWithoutResponse("stopAudio", {
      bees: [bee],
    });
  };

  const volumeUp = () => {
    const newVolume = Math.min(currentVolume + 10, 100);
    setCurrentVolume(newVolume);
    setParamOfBees(newVolume, PDAudioParam.VOLUME);
  };

  const volumeDown = () => {
    const newVolume = Math.max(currentVolume - 10, 0);
    setCurrentVolume(newVolume);
    setParamOfBees(newVolume, PDAudioParam.VOLUME);
  };

  /**
   * When effect is happening, set the selected bee audio scene and audio scene
   */

  useEffect(() => {
    setSelectedBeeAudioScene(beeAudioScene);
  }, [beeAudioScene]);

  useEffect(() => {
    setSelectedAudioScene(beeAudioScene?.audioScene);
  }, [beeAudioScene?.audioScene]);

  useEffect(() => {
    setCurrentVolume(volume);
  }, [volume]);

  return (
    <>
      <SelectSceneModal
        bee={bee}
        onClose={() => setOpenSelectSceneModal(false)}
        open={openSelectSceneModal}
        modalType={SelectSceneModalType.Bee}
      />
      <Card variant="noPadding" title={title}>
        <Box
          sx={{ padding: "10px 10px 0 10px", marginBottom: "10px" }}
          display="grid"
          gap={1}
          gridTemplateColumns="1fr"
          alignItems="center"
        >
          <Box
            display={"grid"}
            gridTemplateColumns={"1fr 0.25fr"}
            gap={2}
            sx={{ padding: "0 0 0 10px" }}
          >
            <NumberSlider
              showNumber={false}
              value={currentVolume}
              marginBottom="0"
              onChangeCommitted={(value) => {
                setCurrenVolume(value);
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
                onClick={volumeDown}
              >
                <RemoveIcon />
              </Button>
              <Button
                sx={{ minWidth: "auto" }}
                color="secondary"
                variant="outlined"
                size="small"
                onClick={volumeUp}
              >
                <AddIcon />
              </Button>
            </Box>
          </Box>
          <Box display="grid" gap={1} gridTemplateColumns="repeat(5, 1fr)">
            <Button
              sx={{ minWidth: "auto" }}
              color="primary"
              variant="contained"
              size="small"
              disabled={selectedAudioScene === undefined}
              onClick={startAudio}
            >
              <PlayArrowIcon />
            </Button>
            <Button
              sx={{ minWidth: "auto" }}
              color="primary"
              variant="contained"
              size="small"
              disabled={selectedAudioScene === undefined}
              onClick={stopAudio}
            >
              <StopIcon />
            </Button>
            <Button
              sx={{ minWidth: "auto" }}
              color={beeAudioScene?.isLooping ? "primary" : "secondary"}
              variant={beeAudioScene?.isLooping ? "contained" : "outlined"}
              size="small"
              disabled={selectedAudioScene === undefined}
              onClick={() => {
                updateBeeLooping(!beeAudioScene?.isLooping);
              }}
            >
              <LoopIcon />
            </Button>
            <Button
              sx={{ minWidth: "auto" }}
              color="secondary"
              variant="outlined"
              size="small"
              disabled={selectedAudioScene === undefined}
              onClick={clearAudioScene}
            >
              <PlaylistRemoveIcon />
            </Button>
            <Button
              sx={{ minWidth: "auto" }}
              color="secondary"
              variant="outlined"
              size="small"
              onClick={() => setOpenSelectSceneModal(true)}
            >
              <FolderIcon />
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundColor: "var(--primary-300)",
            padding: "0 10px 5px 10px",
            marginTop: "10px",
            borderRadius: "0 0 10px 10px",
          }}
        >
          <Typography
            variant="extraSmall"
            color={selectedAudioScene ? "var(--white)" : "var(--grey-500)"}
          >
            {selectedAudioScene?.name || "No Scene Selected"}
          </Typography>
        </Box>
      </Card>
    </>
  );
};
