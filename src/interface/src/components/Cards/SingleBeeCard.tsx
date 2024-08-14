import React, { useEffect, useState } from "react";
import { Card } from "@components/Cards/Card";
import { NumberSlider } from "@components/Slider";
import { Box, Button, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { SelectSceneModal } from "../Modals/SelectScene";
import {
  BeeAudioScene,
  useAppPersistentStorage,
} from "../../hooks/useAppPersistentStorage";
import { AudioScene, IBee } from "@shared/interfaces";
import ClearIcon from "@mui/icons-material/Clear";
import LoopIcon from "@mui/icons-material/Loop";
import { useSocket } from "../../hooks/useSocket";

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
        open={openSelectSceneModal}
        bee={bee}
        onClose={() => setOpenSelectSceneModal(false)}
      />
      <Card variant="extraSmall" title={title}>
        <Box
          display="grid"
          gap={1}
          gridTemplateColumns="1fr 150px"
          alignItems="center"
        >
          <Box sx={{ padding: "0px 10px" }}>
            <NumberSlider
              showNumber={false}
              value={currentVolume}
              marginBottom="0"
              onChangeCommitted={(value) => {
                setCurrentVolume(value);
                sendToServerWithoutResponse("setParamOfBees", {
                  value,
                  type: "volume",
                  bees: [bee],
                });
              }}
            />
          </Box>
          <Box display="grid" gap={1} gridTemplateColumns="1fr 1fr 1fr">
            <Button
              sx={{ minWidth: "auto" }}
              color="primary"
              variant="contained"
              size="small"
              disabled={selectedAudioScene === undefined}
              onClick={() => {
                if (selectedAudioScene) {
                  sendToServerWithoutResponse("startAudio", {
                    scene: selectedAudioScene,
                    bees: [bee],
                  });
                }
              }}
            >
              <PlayArrowIcon />
            </Button>
            <Button
              sx={{ minWidth: "auto" }}
              color="primary"
              variant="contained"
              size="small"
              disabled={selectedAudioScene === undefined}
              onClick={() => {
                sendToServerWithoutResponse("stopAudio", {
                  bees: [bee],
                });
              }}
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
                // get the new value
                const value = !beeAudioScene?.isLooping;

                // let the server know what to do
                sendToServerWithoutResponse("setParamOfBees", {
                  value,
                  type: "fileLoop",
                  bees: [bee],
                });

                // state management
                updateBeeAudioScene(bee, selectedAudioScene, value);
              }}
            >
              <LoopIcon />
            </Button>
          </Box>
          <Box>
            <Typography variant="extraSmall">
              {selectedAudioScene?.name || ""}
            </Typography>
          </Box>
          <Box display="grid" gap={1} gridTemplateColumns="1fr 1fr">
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              fullWidth={true}
              onClick={() => setOpenSelectSceneModal(true)}
            >
              ...
            </Button>
            <Button
              color="secondary"
              variant="outlined"
              size="small"
              fullWidth={true}
              disabled={selectedAudioScene === undefined}
              onClick={() => {
                sendToServerWithoutResponse("stopAudio", {
                  bees: [bee],
                });
                removeBeeAudioScene(bee);
              }}
            >
              <ClearIcon />
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  );
};
