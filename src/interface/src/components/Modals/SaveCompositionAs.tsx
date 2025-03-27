import { BaseModal } from "@components/Modals/BaseModal";
import React, { useState, useEffect } from "react";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { Box, Button, ButtonGroup, TextField } from "@mui/material";
import { useAppPersistentStorage } from "../../hooks/useAppPersistentStorage";
import { useSocket } from "../../hooks/useSocket";
import { AudioScene, InterfaceComposition } from "@shared/interfaces";
import { modalWidth } from "./ModalConfig";

type SaveCompositionAsProps = {
  open: boolean;
  onClose: () => void;
};

export const SaveCompositionAs = ({
  open,
  onClose,
}: SaveCompositionAsProps) => {
  /**
   * Get states and functions from the useAppPersistentStorage hook
   */

  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  const setSelectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.setSelectedInterfaceComposition
  );

  /**
   * Inner states
   */

  const [isOpen, setIsOpen] = useState(open);
  const [compositionName, setCompositionName] = useState("");

  const { sendToServerAndExpectResponseAsync } = useSocket();

  /**
   * Reusable functions
   */

  const saveCompositionAs = async (
    name: string
  ): Promise<InterfaceComposition> => {
    // Filter out bees and audio scenes that don't have an id
    const composition = beeAudioScenes
      .filter((beeAudio) => beeAudio.audioScene !== undefined)
      .map((beeAudio) => ({
        bee: beeAudio.bee,
        audioScene: beeAudio.audioScene as AudioScene, // Type assertion since we filtered undefined
        isLooping: beeAudio.isLooping,
      }));

    // Create the composition object
    const interfaceComposition: Omit<InterfaceComposition, "id"> = {
      name,
      composition,
    };

    // Send the composition to the server
    return (await sendToServerAndExpectResponseAsync(
      "saveInterfaceCompositionAs",
      interfaceComposition
    )) as InterfaceComposition;
  };

  const handleSave = () => {
    if (compositionName !== "") {
      saveCompositionAs(compositionName).then((savedInterfaceComposition) => {
        setSelectedInterfaceComposition(savedInterfaceComposition);
      });
    }
    onClose();
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      handleSave();
    }
  };

  /**
   * When the open prop changes, update the inner state
   */

  useEffect(() => {
    setIsOpen(open);
    return () => {
      setCompositionName("");
    };
  }, [open]);

  return (
    <BaseModal
      width={modalWidth}
      onClose={onClose}
      title="Save To New Composition"
      open={isOpen}
    >
      <TextField
        autoFocus
        size="small"
        value={compositionName}
        onKeyDown={handleKeyDown}
        onChange={(e) => setCompositionName(e.target.value)}
      />
      <ConfirmModalFooter>
        <Box justifyContent="flex-end">
          <ButtonGroup>
            <Button
              type="button"
              size="small"
              color="secondary"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="small"
              color="primary"
              variant="contained"
              onClick={handleSave}
            >
              Save
            </Button>
          </ButtonGroup>
        </Box>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
