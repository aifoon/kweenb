import React, { useCallback, useEffect } from "react";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Z3PageContentSidebar } from "@renderer/src/layout";
import { PageSidebar } from "@components/Sidebar";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  ButtonGroup,
  ButtonSize,
  ButtonType,
  ButtonUse,
} from "@components/Buttons";
import { Card } from "@components/Cards";
import { useAppContext, useBeeStore } from "@renderer/src/hooks";
import { Box, Typography, Button } from "@mui/material";
import { AudioFile, IBee } from "@shared/interfaces";

type AudioFilesProps = {};

export const AudioFiles = (props: AudioFilesProps) => {
  const bees = useBeeStore((state) => state.bees).filter((bee) => bee.isOnline);
  const [selectedBee, setSelectedBee] = React.useState<IBee | null>(null);
  const { appContext } = useAppContext();
  const [currentAudioFiles, setCurrentAudioFiles] = React.useState<AudioFile[]>(
    []
  );
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

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
        setCurrentAudioFiles(audioFiles);
      });
    },
    [bees]
  );

  // when we hook up, we need to get the audio files of the first bee in the list
  useEffect(() => {
    if (currentAudioFiles.length === 0 && bees.length > 0) {
      loadAudioFiles(bees[0]);
    }
  }, [bees]);

  // delete the audio files
  const deleteAudio = useCallback(async () => {
    if (selectedItems.length === 0) return;
    else {
      if (selectedBee === null) return;
      Promise.all(
        selectedItems.map(async (itemId) => {
          await window.kweenb.methods.deleteAudio(selectedBee, itemId);
        })
      ).then(() => {
        loadAudioFiles(selectedBee);
      });
    }
  }, [selectedItems, selectedBee]);

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
    <Box display={"flex"} gap={2} flexDirection={"column"}>
      <Box display={"flex"} justifyContent={"flex-end"}>
        <ButtonGroup>
          <Button
            variant={"contained"}
            size="small"
            color="secondary"
            key="delete_forever"
            disabled={selectedItems.length === 0}
            onClick={deleteAudio}
          >
            <DeleteForeverIcon style={{ fontSize: ".8rem" }} />
          </Button>
          <Button
            variant={"contained"}
            size="small"
            color="secondary"
            key="refresh_list"
            onClick={() => loadAudioFiles(selectedBee)}
          >
            <RefreshIcon style={{ fontSize: ".8rem" }} />
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            key="upload_scene"
            onClick={async () => {
              appContext.setOpenUploadAudioFilesSettings(true);
            }}
          >
            Upload Scene
          </Button>
        </ButtonGroup>
      </Box>
      <Z3PageContentSidebar
        pageSidebar={
          <PageSidebar
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
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          <Card variant="small">
            <SimpleTreeView
              onSelectedItemsChange={handleSelectedItemsChange}
              multiSelect
              selectedItems={selectedItems}
              checkboxSelection
            >
              {currentAudioFiles.map((audioFile) => (
                <TreeItem
                  disabled={audioFile.name === "tests"}
                  key={audioFile.name}
                  itemId={audioFile.fullPath}
                  label={audioFile.name}
                >
                  {audioFile.files.map((file) => (
                    <TreeItem
                      disabled={audioFile.name === "tests"}
                      key={file.name}
                      itemId={file.fullPath}
                      label={file.name}
                    />
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          </Card>
        </Box>
      </Z3PageContentSidebar>
    </Box>
  );
};
