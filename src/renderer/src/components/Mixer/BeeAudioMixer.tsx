import { Card } from "@components/Cards";
import { NumberSlider } from "@components/Slider";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Box } from "@mui/material";
import { useAudioMixerStore } from "@renderer/src/hooks";
import { IBee } from "@shared/interfaces";
import React from "react";

type BeeAudioMixerProps = {
  bee: IBee;
  low?: number;
  high?: number;
  mid?: number;
  volume?: number;
};

export const BeeAudioMixer = ({ bee }: BeeAudioMixerProps) => {
  const sliderHeight = "100px";

  /**
   * State Management audio
   */
  const beeAudioParams = useAudioMixerStore((state) => state.beeAudioParams);
  const beeAudioParam = beeAudioParams.find((b) => b.bee.id === bee.id);
  const setBeeVolume = useAudioMixerStore((state) => state.setBeeVolume);
  const setBeeMid = useAudioMixerStore((state) => state.setBeeMid);
  const setBeeHigh = useAudioMixerStore((state) => state.setBeeHigh);
  const setBeeLow = useAudioMixerStore((state) => state.setBeeLow);

  return (
    <Card
      statusBullet={
        <StatusBullet
          type={
            bee.isOnline ? StatusBulletType.Active : StatusBulletType.NotActive
          }
          size={10}
        />
      }
      title={bee.name}
      variant="small"
    >
      {beeAudioParam && (
        <Box display={"grid"} gridTemplateColumns={"repeat(4, 1fr)"} gap={1}>
          <NumberSlider
            step={0.1}
            sliderHeight={sliderHeight}
            labelWidth="auto"
            label="Low"
            min={0}
            max={2}
            orientation="vertical"
            typographyVariant="small"
            value={beeAudioParam?.low || 0}
            onChangeCommitted={(value) => {
              setBeeLow(bee, value);
            }}
          ></NumberSlider>
          <NumberSlider
            step={0.1}
            sliderHeight={sliderHeight}
            labelWidth="auto"
            label="Mid"
            min={0}
            max={2}
            orientation="vertical"
            typographyVariant="small"
            value={beeAudioParam?.mid || 0}
            onChangeCommitted={(value) => {
              setBeeMid(bee, value);
            }}
          ></NumberSlider>
          <NumberSlider
            step={0.1}
            sliderHeight={sliderHeight}
            labelWidth="auto"
            label="High"
            min={0}
            max={2}
            orientation="vertical"
            typographyVariant="small"
            value={beeAudioParam?.high || 0}
            onChangeCommitted={(value) => {
              setBeeHigh(bee, value);
            }}
          ></NumberSlider>
          <NumberSlider
            step={1}
            sliderHeight={sliderHeight}
            labelWidth="auto"
            label="Vol"
            orientation="vertical"
            typographyVariant="small"
            value={beeAudioParam?.volume || 0}
            onChangeCommitted={(value) => {
              setBeeVolume(bee, value);
            }}
          ></NumberSlider>
        </Box>
      )}
    </Card>
  );
};
