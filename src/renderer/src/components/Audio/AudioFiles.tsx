import React, { useCallback, useState, useEffect } from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Z3PageContentSidebar } from "@components/Layout";
import { PageSidebar } from "@components/Sidebar";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { ButtonGroup } from "@components/Buttons";
import { Card } from "@components/Cards";
import { useAppStore, useBeeStore } from "@renderer/src/hooks";
import { Box, Typography, Button, TextField } from "@mui/material";
import { AudioFile, IBee } from "@shared/interfaces";
import { DeleteAudioScenes } from "../Modals";

type AudioFilesProps = {};

export const AudioFiles = (props: AudioFilesProps) => {
  // Bee Store
  const bees = useBeeStore((state) => state.bees).filter((bee) => bee.isOnline);

  // App Store
  const setOpenUploadAudioFilesSettings = useAppStore(
    (state) => state.setOpenUploadAudioFilesSettings
  );

  // Inner State
  const [selectedBee, setSelectedBee] = useState<IBee | null>(null);
  const [currentAudioFiles, setCurrentAudioFiles] = useState<AudioFile[]>([]);
  const [currentFilter, setCurrentFilter] = useState<string>("");
  const [filteredAudioFiles, setFilteredAudioFiles] = useState<AudioFile[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteAudioScenesOpen, handleIsDeleteAudioScenesOpen] =
    useState(false);

  // handle selected items
  const handleSelectedItemsChange = (
    event: React.SyntheticEvent,
    ids: string[]
  ) => {
    setSelectedItems(ids);
  };

  // load the current audio files
  const loadAudioFiles = useCallback(
    (bee) => {
      window.kweenb.methods.getAudioFiles(bee).then((audioFiles) => {
        setSelectedBee(bee);
        const audioFilesWithoutTests = audioFiles.filter(
          (audioFile) => audioFile.name !== "tests"
        );
        setCurrentAudioFiles(audioFilesWithoutTests);
        setFilteredAudioFiles(audioFilesWithoutTests);
      });
    },
    [bees]
  );

  // when we hook up, we need to get the audio files of the first bee in the list
  useEffect(() => {
    if (bees.length > 0) {
      loadAudioFiles(bees[0]);
    }
    return () => {
      setFilteredAudioFiles([]);
      setCurrentAudioFiles([]);
      setCurrentFilter("");
    };
  }, []);

  useEffect(() => {
    if (currentAudioFiles.length > 0) {
      const filteredAudioFiles = currentAudioFiles.filter((audioFile) =>
        audioFile.name.toLowerCase().includes(currentFilter.toLowerCase())
      );
      setFilteredAudioFiles(filteredAudioFiles);
    } else {
      setFilteredAudioFiles([]);
    }
  }, [currentFilter, currentAudioFiles]);

  // delete the audio files
  const deleteAudio = useCallback(
    async (deleteOnAllBees: boolean) => {
      if (selectedItems.length === 0) return;
      else {
        if (selectedBee === null) return;
        Promise.all(
          selectedItems.map(async (itemId) => {
            await window.kweenb.methods.deleteAudio(
              selectedBee,
              itemId,
              deleteOnAllBees
            );
          })
        ).then(() => {
          setSelectedItems([]);
          loadAudioFiles(selectedBee);
        });
      }
    },
    [selectedItems, selectedBee]
  );

  // if there are no bees online, we can't manage any files
  if (bees.length === 0)
    return (
      <Box>
        <Typography>
          There are no bees online, no files can be managed
        </Typography>
      </Box>
    );

  return (
    <>
      <DeleteAudioScenes
        open={isDeleteAudioScenesOpen}
        onClose={() => {
          handleIsDeleteAudioScenesOpen(false);
        }}
        onConfirm={(deleteOnAllBees) => {
          handleIsDeleteAudioScenesOpen(false);
          deleteAudio(deleteOnAllBees);
        }}
      />
      <Box display={"flex"} gap={2} flexDirection={"column"}>
        <Box display={"flex"} justifyContent={"flex-end"}>
          <ButtonGroup>
            <Button
              variant={"contained"}
              size="small"
              color="error"
              key="delete_forever"
              disabled={selectedItems.length === 0}
              onClick={() => handleIsDeleteAudioScenesOpen(true)}
            >
              DELETE
            </Button>
            <Button
              variant={"contained"}
              size="small"
              color="secondary"
              key="refresh_list"
              onClick={() => loadAudioFiles(selectedBee)}
            >
              REFRESH
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              key="upload_scene"
              onClick={async () => {
                setOpenUploadAudioFilesSettings(true);
              }}
            >
              Upload Scene
            </Button>
          </ButtonGroup>
        </Box>
        <Z3PageContentSidebar
          sidebar={
            <PageSidebar
              filterButtons
              buttons={bees.map((bee) => (
                <Button
                  variant={selectedBee?.id === bee.id ? "contained" : "text"}
                  style={{ justifyContent: "left" }}
                  size="small"
                  color="secondary"
                  key={bee.id}
                  onClick={async () => {
                    await loadAudioFiles(bee);
                    setSelectedItems([]);
                  }}
                >
                  {bee.name}
                </Button>
              ))}
            />
          }
        >
          <Box display={"flex"} flexDirection={"column"}>
            <TextField
              sx={{ marginBottom: "10px" }}
              size="small"
              value={currentFilter}
              onChange={(event) => setCurrentFilter(event.target.value)}
            />
            {filteredAudioFiles.length === 0 && (
              <Card variant="small">
                <Typography>
                  No audio files with current filter are found on this bee.
                </Typography>
              </Card>
            )}
            {filteredAudioFiles.length > 0 && (
              <Card variant="small">
                <SimpleTreeView
                  onSelectedItemsChange={handleSelectedItemsChange}
                  multiSelect
                  selectedItems={selectedItems}
                  checkboxSelection
                >
                  {filteredAudioFiles.map((audioFile) => {
                    return (
                      <TreeItem
                        sx={{
                          ".MuiTreeItem-iconContainer": {
                            display: "none !important",
                          },
                        }}
                        disabled={audioFile.name === "tests"}
                        key={audioFile.name}
                        itemId={audioFile.fullPath}
                        label={audioFile.name}
                      />
                    );
                  })}
                </SimpleTreeView>
              </Card>
            )}
          </Box>
        </Z3PageContentSidebar>
      </Box>
    </>
  );
};
