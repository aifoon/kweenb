import { BaseModal } from "@components/Modals/BaseModal";
import { Box, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { demoScenes } from "@seeds/demoScenes";
import { AudioScene, IBee } from "@shared/interfaces";
import { Button } from "@mui/material";
import { useAppPersistentStorage } from "../../hooks/useAppPersistentStorage";
import { useSocket } from "../../hooks/useSocket";
import { Loader } from "@components/Loader";
import styled from "styled-components";

interface SelectSceneModalProps {
  open: boolean;
  bee?: IBee | undefined;
  onClose: () => void;
}

/**
 * Variables
 */

const modalHeight = "80vh";
const modalWidth = "80vw";
const headerHeight = "40px";
const textFieldHeight = 40;
const textFieldMargin = "10px";

const FilterTextfieldContainer = styled(Box)<{ $hasBee: boolean }>`
  grid-template-columns: ${({ $hasBee }) => ($hasBee ? "1fr" : "1fr 150px")};
  height: ${textFieldHeight}px;
  margin-bottom: ${textFieldMargin};
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    height: ${({ $hasBee }) =>
      $hasBee ? `${textFieldHeight}px` : `${textFieldHeight * 2}px`};
  }
`;

export const SelectSceneModal = ({
  open,
  onClose,
  bee,
}: SelectSceneModalProps) => {
  /**
   * Inner states
   */

  const [isOpen, setIsOpen] = useState(open);
  const [audioScenes, setAudioScenes] = useState<AudioScene[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * Web socket
   */

  const { sendToServerAndExpectResponseAsync } = useSocket();

  /**
   * Variables
   */

  const filteredScenes = audioScenes.filter((scene) =>
    scene.name.toLowerCase().includes(filterValue.toLowerCase())
  );

  /**
   * Get states and functions from the useAppPersistentStorage hook
   */

  const updateBeeAudioScene = useAppPersistentStorage(
    (state) => state.updateBeeAudioScene
  );

  const addOrderedAudioScene = useAppPersistentStorage(
    (state) => state.addOrderedAudioScene
  );

  const orderedAudioScenes = useAppPersistentStorage(
    (state) => state.orderedAudioScenes
  );

  const cachedAudioScenes = useAppPersistentStorage(
    (state) => state.cachedAudioScenes
  );

  const setCachedAudioScenes = useAppPersistentStorage(
    (state) => state.setCachedAudioScenes
  );

  /**
   * Reusable functions
   */

  const fetchScenesForBee = async (bee: IBee) => {
    sendToServerAndExpectResponseAsync("fetchScenesForBee", bee)
      .then((data) => {
        setAudioScenes(data as AudioScene[]);
      })
      .finally(() => setLoading(false));
  };

  const fetchAllScenes = async () => {
    sendToServerAndExpectResponseAsync("fetchAllScenes")
      .then((data) => {
        setAudioScenes(data as AudioScene[]);
        setCachedAudioScenes(data as AudioScene[]);
      })
      .finally(() => setLoading(false));
  };

  /**
   * When the modal is opening, set the current open state and set the audio scenes
   */

  useEffect(() => {
    // set current open
    setIsOpen(open);

    // start with loading indicator
    setLoading(true);

    // if the modal is open
    if (open) {
      // if bee is provided, filter the scenes based on the beeId
      if (bee) {
        fetchScenesForBee(bee);
      }

      // fetch all bees if no bee is provided
      else {
        if (cachedAudioScenes && cachedAudioScenes.length > 0) {
          setAudioScenes(cachedAudioScenes);
          setLoading(false);
        } else {
          fetchAllScenes();
        }
      }
    }

    // when closing the model, reset the filter value and audio scenes
    return () => {
      setFilterValue("");
      setAudioScenes([]);
    };
  }, [open]);

  return (
    <BaseModal
      disableBackdropClick
      open={isOpen}
      showCloseButton={true}
      onClose={onClose}
      title="Select Scene"
      width={modalWidth}
      height={modalHeight}
    >
      {loading && <Loader text="Fetching scenes" />}
      {!loading && (
        <>
          <FilterTextfieldContainer display={"grid"} $hasBee={!!bee} gap={1}>
            <TextField
              autoFocus
              size="small"
              onChange={(e) => setFilterValue(e.target.value)}
            />
            {!bee && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => {
                  setLoading(true);
                  fetchAllScenes();
                }}
              >
                Reload Cache
              </Button>
            )}
          </FilterTextfieldContainer>
          <Box
            height={`calc(${modalHeight} - ${headerHeight} - ${textFieldHeight} - ${textFieldMargin} - (2 * var(--modalPadding) ) )`}
            overflow={"scroll"}
          >
            {filteredScenes.length > 0 && (
              <Grid container spacing={1}>
                {filteredScenes.map((scene) => (
                  <Grid key={scene.name} item xs={12} md={3}>
                    <Button
                      fullWidth={true}
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        if (bee) updateBeeAudioScene(bee || 0, scene);
                        else {
                          addOrderedAudioScene({
                            order: orderedAudioScenes.length,
                            audioScene: scene,
                          });
                        }
                        onClose();
                      }}
                    >
                      {scene.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}
            {filteredScenes.length === 0 && <Box>No scenes found</Box>}
          </Box>
        </>
      )}
    </BaseModal>
  );
};
