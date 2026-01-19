import { BaseModal } from "@components/Modals/BaseModal";
import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Grid } from "@mui/material";
import { useAppPersistentStorage } from "../../hooks/useAppPersistentStorage";
import { InterfaceComposition } from "@shared/interfaces";
import { useSocket } from "../../hooks/useSocket";
import {
  FilterTextfieldContainer,
  FilteredContentContainer,
} from "./FilterComponents";
import { modalWidth, modalHeight } from "./ModalConfig";
import { Loader } from "@components/Loader";
import { Utils } from "@shared/utils";
import { useAppStore } from "../../hooks/useAppStore";

type CompositionsAsProps = {
  open: boolean;
  onClose: () => void;
};

export const Compositions = ({ open, onClose }: CompositionsAsProps) => {
  /**
   * Get states and functions from the useAppPersistentStorage hook
   */

  const beeAudioScenes = useAppPersistentStorage(
    (state) => state.beeAudioScenes
  );

  // get the saved bee audio scenes
  const removeAllAudioScenes = useAppPersistentStorage(
    (state) => state.removeAllAudioScenes
  );

  // update the bee audio scene
  const updateBeeAudioScene = useAppPersistentStorage(
    (state) => state.updateBeeAudioScene
  );

  // set the selected interface composition
  const setSelectedInterfaceComposition = useAppPersistentStorage(
    (state) => state.setSelectedInterfaceComposition
  );

  /**
   * Inner states
   */

  const [isOpen, setIsOpen] = useState(open);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [interfaceCompositions, setInterfaceCompositions] = useState<
    InterfaceComposition[]
  >([]);
  const currentSwarm = useAppStore((state) => state.currentSwarm);
  const seletedInterfaceComposition = useAppPersistentStorage(
    (state) => state.selectedInterfaceComposition
  );

  /**
   * Variables
   */

  const filteredInterfaceCompositions = interfaceCompositions.filter(
    (interfaceComposition) =>
      interfaceComposition.name
        .toLowerCase()
        .includes(filterValue.toLowerCase())
  );

  /**
   * Web socket
   */

  const { sendToServerAndExpectResponseAsync, sendToServerWithoutResponse } =
    useSocket();

  /**
   * Reusable functions
   */

  const deleteInterfaceComposition = (
    interfaceComposition: InterfaceComposition
  ) => {
    // Send the delete interface composition message
    sendToServerAndExpectResponseAsync(
      "deleteInterfaceComposition",
      interfaceComposition
    ).then(() => {
      // Remove the composition from the list
      setInterfaceCompositions(
        interfaceCompositions.filter(
          (composition) => composition.id !== interfaceComposition.id
        )
      );

      // If the deleted composition is the selected composition, remove the selected composition
      if (
        seletedInterfaceComposition &&
        seletedInterfaceComposition.id === interfaceComposition.id
      ) {
        setSelectedInterfaceComposition(undefined);
      }
    });
  };

  const fetchInterfaceCompositions = async () => {
    sendToServerAndExpectResponseAsync("fetchInterfaceCompositions")
      .then((data) => {
        console.log("Fetched Interface Compositions:", data);
        setInterfaceCompositions(data as InterfaceComposition[]);
      })
      .finally(() => setLoading(false));
  };

  const loadInterfaceComposition = (
    interfaceComposition: InterfaceComposition
  ) => {
    // Remove all audio scenes
    removeAllAudioScenes();

    // Stop all audio
    sendToServerWithoutResponse("stopAudio", {
      bees: beeAudioScenes.map((beeAudioScene) => {
        return beeAudioScene.bee;
      }),
    });

    // Update the bee audio scenes
    interfaceComposition.composition.forEach((compositionItem) => {
      // Find the bee in the current swarm
      const bee = currentSwarm.find((bee) => bee.id === compositionItem.bee.id);

      // If the bee is found, update the bee audio scene
      if (bee) {
        updateBeeAudioScene(
          compositionItem.bee,
          compositionItem.audioScene,
          compositionItem.isLooping
        );
      }
    });

    // Set the selected interface composition
    setSelectedInterfaceComposition(interfaceComposition);

    // Close the modal
    onClose();
  };

  /**
   * When the open prop changes, update the inner state
   */

  useEffect(() => {
    // set current to open
    setIsOpen(open);

    // set the loading state
    setLoading(true);

    // if the modal is open
    if (open) {
      // fetch the interface compositions
      fetchInterfaceCompositions();
    }

    // when closing the model, reset the interface compositions
    return () => {
      setInterfaceCompositions([]);
      setFilterValue("");
      setIsDeleteMode(false);
    };
  }, [open]);

  return (
    <BaseModal
      onClose={onClose}
      title="Load Composition"
      open={isOpen}
      height={modalHeight}
      width={modalWidth}
    >
      {loading && <Loader text="Fetching scenes" />}
      {!loading && (
        <>
          <FilterTextfieldContainer
            display={"grid"}
            $hasSidebutton={true}
            gap={1}
          >
            <TextField
              autoFocus
              size="small"
              onChange={(e) => setFilterValue(e.target.value)}
            />
            <Button
              variant={isDeleteMode ? "contained" : "outlined"}
              color={isDeleteMode ? "error" : "secondary"}
              size="small"
              onClick={() => {
                setIsDeleteMode(!isDeleteMode);
              }}
            >
              Delete Mode
            </Button>
          </FilterTextfieldContainer>
          <FilteredContentContainer overflow={"scroll"}>
            {filteredInterfaceCompositions.length > 0 && (
              <Grid container spacing={1}>
                {filteredInterfaceCompositions.map((interfaceComposition) => (
                  <Grid
                    key={Utils.generateUniqueIdForReactComponents()}
                    item
                    xs={12}
                    md={3}
                  >
                    {!isDeleteMode && (
                      <Button
                        fullWidth={true}
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          loadInterfaceComposition(interfaceComposition)
                        }
                      >
                        {interfaceComposition.name}
                      </Button>
                    )}
                    {isDeleteMode && (
                      <Button
                        fullWidth={true}
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => {
                          deleteInterfaceComposition(interfaceComposition);
                        }}
                      >
                        {interfaceComposition.name}
                      </Button>
                    )}
                  </Grid>
                ))}
              </Grid>
            )}
            {filteredInterfaceCompositions.length === 0 && (
              <Box>No compositions found</Box>
            )}
          </FilteredContentContainer>
        </>
      )}
    </BaseModal>
  );
};
