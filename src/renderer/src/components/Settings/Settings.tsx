import { Loader } from "@components/Loader";
import { Tab } from "@mui/material";
import { useSettings, useAppStore } from "@renderer/src/hooks";
import React, { useState } from "react";
import { Tabs, TabPanel } from "@components/Tabs";
import { PageHeader } from "@components/PageHeader";
import { Z3Page } from "@components/Layout";
import { SettingsAudio, SettingsPositioning } from ".";

export const Settings = () => {
  const { loading, settings, reloadSettings } = useSettings();
  const [value, setValue] = useState(0);

  if (loading || !settings) return <Loader />;

  const handleChange = async (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any
  ) => {
    await reloadSettings();
    setValue(newValue);
  };

  return (
    <Z3Page pageHeader={<PageHeader title="Settings" />}>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Audio" />
        <Tab label="Positioning" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <SettingsAudio settings={settings} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SettingsPositioning
          updateRate={settings.positioningSettings.updateRate}
        />
      </TabPanel>
    </Z3Page>
  );
};
