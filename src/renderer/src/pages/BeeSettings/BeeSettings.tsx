import { Loader } from "@components/Loader";
import { Grid } from "@mui/material";
import { CardVerticalStack } from "@renderer/src/components/Cards";
import { useSettings } from "@renderer/src/hooks";
import React from "react";
import { PageHeader } from "../../components/PageHeader";
import { Z3Page } from "../../layout";
import { BeeSettingsBees } from "./BeeSettingsBees";
import { BeeSettingsKweenB } from "./BeeSettingsKweenB";
import { BeeSettingsTheKween } from "./BeeSettingsTheKween";

export const BeeSettings = () => {
  const { loading, settings } = useSettings();

  if (loading || !settings) return <Loader />;

  return (
    <Z3Page pageHeader={<PageHeader title="Bee Settings" />}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <BeeSettingsBees beeAudioSettings={settings.beeAudioSettings} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CardVerticalStack>
            <BeeSettingsKweenB
              channels={settings.kweenBAudioSettings.channels}
            />
            <BeeSettingsTheKween
              ipAddress={settings.theKweenSettings.ipAddress}
            />
          </CardVerticalStack>
        </Grid>
      </Grid>
    </Z3Page>
  );
};
