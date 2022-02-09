import { Grid } from "@mui/material";
import { CardVerticalStack } from "@renderer/src/components/Cards";
import React from "react";
import { PageHeader } from "../../components/PageHeader";
import { Z3Page } from "../../layout";
import { BeeSettingsBees } from "./BeeSettingsBees";
import { BeeSettingsKweenB } from "./BeeSettingsKweenB";
import { BeeSettingsTheKween } from "./BeeSettingsTheKween";

export const BeeSettings = () => (
  <Z3Page pageHeader={<PageHeader title="Bee Settings" />}>
    <Grid container spacing={5}>
      <Grid item xs={12} md={6}>
        <BeeSettingsBees
          beeAudioSettings={{
            channels: 2,
            jack: {
              bufferSize: 16,
              sampleRate: 48000,
            },
            jacktrip: {
              bitRate: 16,
              queueBufferLength: 4,
              redundancy: 1,
            },
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CardVerticalStack>
          <BeeSettingsKweenB channels={2} />
          <BeeSettingsTheKween ipAddress="192.168.43.1" />
        </CardVerticalStack>
      </Grid>
    </Grid>
  </Z3Page>
);
