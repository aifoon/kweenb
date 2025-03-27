import { Card } from "@components/Cards/Card";
import { Box, Button, Typography } from "@mui/material";
import { AudioScene } from "@shared/interfaces";
import React, { useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import ClearIcon from "@mui/icons-material/Clear";
import {
  OrderedAudioScene,
  useAppPersistentStorage,
} from "../../hooks/useAppPersistentStorage";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useSocket } from "../../hooks/useSocket";

type TriggerSceneCardProps = {
  orderedAudioScene: OrderedAudioScene;
  isFirst?: boolean;
  isLast?: boolean;
};

export const TriggerSceneCard = ({
  isLast = false,
  isFirst = false,
  orderedAudioScene,
}: TriggerSceneCardProps) => {
  /**
   * Inner states
   */

  const [isFirstState, setIsFirstState] = React.useState(isFirst);
  const [isLastState, setIsLastState] = React.useState(isLast);

  /**
   * When the props change, update the inner states
   */

  useEffect(() => {
    setIsFirstState(isFirst);
  }, [isFirst]);

  useEffect(() => {
    setIsLastState(isLast);
  }, [isLast]);

  /**
   * Get states and functions from the useAppPersistentStorage hook
   */
  const moveUpOrderedAudioScene = useAppPersistentStorage(
    (state) => state.moveUpOrderedAudioScene
  );

  const moveDownOrderedAudioScene = useAppPersistentStorage(
    (state) => state.moveDownOrderedAudioScene
  );

  const removeOrderedAudioScene = useAppPersistentStorage(
    (state) => state.removeOrderedAudioScene
  );

  const setSelectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.setSelectedInterfaceComposition
  );

  const setAllBeesToAudioScene = useAppPersistentStorage(
    (state) => state.setAllBeesToAudioScene
  );

  /**
   * Use Sockets
   */

  const { sendToServerWithoutResponse } = useSocket();

  return (
    <Card
      variant="extraSmall"
      headerButtons={[
        <Button
          sx={{ padding: 0, minWidth: "auto" }}
          key={`clear_audioscene_left_${orderedAudioScene.audioScene.name}`}
          onClick={() => moveDownOrderedAudioScene(orderedAudioScene)}
          style={{ display: isFirstState ? "none" : "flex" }}
          color="secondary"
          variant="text"
          size="small"
        >
          <ChevronLeftIcon />
        </Button>,
        <Button
          sx={{ padding: 0, minWidth: "auto" }}
          key={`clear_audioscene_right_${orderedAudioScene.audioScene.name}`}
          onClick={() => moveUpOrderedAudioScene(orderedAudioScene)}
          style={{ display: isLastState ? "none" : "flex" }}
          color="secondary"
          variant="text"
          size="small"
        >
          <ChevronRightIcon />
        </Button>,
        <Button
          sx={{ padding: 0, minWidth: "auto" }}
          key={`clear_audioscene_clear_${orderedAudioScene.audioScene.name}`}
          onClick={() => removeOrderedAudioScene(orderedAudioScene)}
          color="secondary"
          variant="outlined"
          size="small"
        >
          <ClearIcon />
        </Button>,
      ]}
    >
      <Box display="grid" gap={1} gridTemplateColumns="1fr">
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={() => {
            if (orderedAudioScene.audioScene.foundOnBees.length > 0) {
              sendToServerWithoutResponse("startAudio", {
                bees: orderedAudioScene.audioScene.foundOnBees,
                scene: orderedAudioScene.audioScene,
              });
              setAllBeesToAudioScene(orderedAudioScene.audioScene);
              setSelectedInterfaceComposition(undefined); // Clear the selected composition (because we are overriding it)
            }
          }}
        >
          <Box display={"flex"} gap={1} alignItems={"center"}>
            <PlayArrowIcon />
            <Typography variant="extraSmall">
              {orderedAudioScene.audioScene.name}
            </Typography>
          </Box>
        </Button>
      </Box>
    </Card>
  );
};
