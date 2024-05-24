import { Card } from "@components/Cards";
import { BeeAudioMixer } from "@components/Mixer/BeeAudioMixer";
import { NumberSlider } from "@components/Slider";
import { Box, Grid } from "@mui/material";
import { useAudioMixerStore, useBeeStore } from "@renderer/src/hooks";
import { useEffect, useState } from "react";

interface AudioMixerProps {}

export const AudioMixer = ({}: AudioMixerProps) => {
  /**
   * State Management audio
   */
  const masterVolume = useAudioMixerStore((state) => state.masterVolume);
  const masterHigh = useAudioMixerStore((state) => state.masterHigh);
  const masterMid = useAudioMixerStore((state) => state.masterMid);
  const masterLow = useAudioMixerStore((state) => state.masterLow);
  const beeAudioParams = useAudioMixerStore((state) => state.beeAudioParams);
  const setMasterVolume = useAudioMixerStore((state) => state.setMasterVolume);
  const setMasterHigh = useAudioMixerStore((state) => state.setMasterHigh);
  const setMasterMid = useAudioMixerStore((state) => state.setMasterMid);
  const setMasterLow = useAudioMixerStore((state) => state.setMasterLow);

  /**
   * State management bees
   */
  const bees = useBeeStore((state) => state.bees);

  /**
   * Initialize the bee audio params when bees are loaded
   */
  if (beeAudioParams.length === 0 && bees.length > 0) {
    const beeAudioParams = bees.map((bee) => {
      return {
        bee,
        low: masterLow,
        mid: masterMid,
        high: masterHigh,
        volume: masterVolume,
      };
    });
    useAudioMixerStore.setState({ beeAudioParams });
  }

  return (
    <Box gap={3} display={"flex"} flexDirection={"column"}>
      <Card key="master" title="Master" variant="small">
        <NumberSlider
          step={0.1}
          labelWidth="50px"
          label="Low"
          min={0}
          max={2}
          orientation="horizontal"
          typographyVariant="small"
          onChangeCommitted={(value) => {
            setMasterLow(value);
          }}
          value={masterLow}
        />
        <NumberSlider
          step={0.1}
          labelWidth="50px"
          label="Mid"
          min={0}
          max={2}
          orientation="horizontal"
          typographyVariant="small"
          onChangeCommitted={(value) => {
            setMasterMid(value);
          }}
          value={masterMid}
        />
        <NumberSlider
          step={0.1}
          labelWidth="50px"
          label="High"
          min={0}
          max={2}
          orientation="horizontal"
          typographyVariant="small"
          onChangeCommitted={(value) => {
            setMasterHigh(value);
          }}
          value={masterHigh}
        />
        <NumberSlider
          step={1}
          labelWidth="50px"
          label="Vol"
          orientation="horizontal"
          typographyVariant="small"
          onChangeCommitted={(value) => {
            setMasterVolume(value);
          }}
          value={masterVolume}
        />
      </Card>
      <Grid container spacing={2}>
        {bees &&
          bees.map((bee) => {
            return (
              <Grid key={bee.id} item xs={12} md={4} lg={3} xl={2}>
                <BeeAudioMixer
                  volume={
                    beeAudioParams.find((b) => b.bee.id === bee.id)?.volume
                  }
                  low={beeAudioParams.find((b) => b.bee.id === bee.id)?.low}
                  mid={beeAudioParams.find((b) => b.bee.id === bee.id)?.mid}
                  high={beeAudioParams.find((b) => b.bee.id === bee.id)?.high}
                  bee={bee}
                  key={bee.id}
                ></BeeAudioMixer>
              </Grid>
            );
          })}
      </Grid>
    </Box>
  );
};
