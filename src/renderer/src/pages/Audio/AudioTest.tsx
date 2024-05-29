import { ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Button, Box, Grid } from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import { useBeeStore } from "@renderer/src/hooks";
import React from "react";

type AudioTestsProps = {};

/**
 * Test audio files
 */
const testAudio = [
  {
    name: "speaker ready",
    file: "tests/speakerready.wav",
  },
  {
    name: "sample",
    file: "tests/sample.wav",
  },
];

export const AudioTest = (props: AudioTestsProps) => {
  const bees = useBeeStore((state) => state.bees).filter((bee) => bee.isActive);

  return (
    <Grid container spacing={2}>
      <Grid key={"all_bees"} item xs={12} md={4} lg={3} xl={2}>
        <Card
          headerButtons={[
            <Button
              key={`test-stop-all_bees`}
              variant="text"
              size="small"
              color="secondary"
              onClick={() => {
                bees.forEach((bee) => window.kweenb.methods.stopAudio(bee));
              }}
              sx={{
                padding: 0,
                minWidth: 0,
              }}
            >
              <StopIcon />
            </Button>,
          ]}
          title="All Bees"
          variant="small"
        >
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            {testAudio.map((audio) => (
              <Button
                key={`${audio.file}.all_bees`}
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => {
                  bees.forEach((bee) =>
                    window.kweenb.methods.startAudio(bee, audio.file)
                  );
                }}
              >
                {audio.name}
              </Button>
            ))}
          </Box>
        </Card>
      </Grid>
      {bees &&
        bees.map((bee) => {
          return (
            <Grid key={bee.id} item xs={12} md={4} lg={3} xl={2}>
              <Card
                statusBullet={
                  <StatusBullet
                    type={
                      bee.isOnline
                        ? StatusBulletType.Active
                        : StatusBulletType.NotActive
                    }
                    size={10}
                  />
                }
                headerButtons={[
                  <Button
                    key={`test-stop-${bee.id}`}
                    variant="text"
                    size="small"
                    color="secondary"
                    onClick={() => window.kweenb.methods.stopAudio(bee)}
                    style={{ padding: 0 }}
                  >
                    <StopIcon />
                  </Button>,
                ]}
                title={bee.name}
                variant="small"
              >
                <Box display={"flex"} flexDirection={"column"} gap={1}>
                  {testAudio.map((audio) => (
                    <Button
                      key={`${audio.file}.${bee.id}`}
                      variant="contained"
                      size="small"
                      color="secondary"
                      onClick={() =>
                        window.kweenb.methods.startAudio(bee, audio.file)
                      }
                    >
                      {audio.name}
                    </Button>
                  ))}
                </Box>
              </Card>
            </Grid>
          );
        })}
    </Grid>
  );
};
