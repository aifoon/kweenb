import { BaseModal } from "@components/Modals/BaseModal";
import { Box, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { demoScenes } from "../../seeds/demoScenes";
import { AudioScene, IBee } from "@shared/interfaces";
import { Button } from "@mui/material";
import { useAppPersistentStorage } from "../../hooks/useAppPersistentStorage";

type SelectSceneModalProps = {
  open: boolean;
  bee?: IBee | undefined;
  onClose: () => void;
};

export const SelectSceneModal = ({
  open,
  onClose,
  bee,
}: SelectSceneModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [audioScenes, setAudioScenes] = useState<AudioScene[]>([]);
  const [filterValue, setFilterValue] = useState("");

  /**
   * Variables
   */

  const modalHeight = "80vh";
  const modalWidth = "80vw";
  const headerHeight = "40px";
  const textFieldHeight = "40px";
  const textFieldMargin = "10px";
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

  /**
   * When the modal is opening, set the current open state and set the audio scenes
   */

  useEffect(() => {
    // set current open
    setIsOpen(open);

    // if the modal is open
    if (open) {
      // the scenes to be displayed (all is default)
      let beeScenes = demoScenes;

      // if beeId is provided, filter the scenes based on the beeId
      if (bee) {
        beeScenes = demoScenes.filter((scene) =>
          scene.foundOnBees.some((currentBee) => currentBee.id === bee.id)
        );
      }

      // set the current audio scenes
      setAudioScenes(beeScenes);
    }
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
      <TextField
        style={{ height: textFieldHeight, marginBottom: textFieldMargin }}
        autoFocus
        size="small"
        onChange={(e) => setFilterValue(e.target.value)}
      />
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
    </BaseModal>
  );
};
