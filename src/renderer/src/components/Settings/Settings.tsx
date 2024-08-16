import { Loader } from "@components/Loader";
import { Tab } from "@mui/material";
import { useSettings, useAppStore } from "@renderer/src/hooks";
import React, { useState } from "react";
import { Tabs, TabPanel } from "@components/Tabs";
import { PageHeader } from "@components/PageHeader";
import { Z3Page } from "@components/Layout";
import { SettingsBees, SettingsKweenB, SettingsPositioning } from ".";

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
    <Z3Page pageHeader={<PageHeader title="Bee Settings" />}>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Bee" />
        <Tab label="KweenB" />
        <Tab label="Positioning" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <SettingsBees beeAudioSettings={settings.beeAudioSettings} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SettingsKweenB
          kweenbSettings={settings.kweenBSettings}
          kweenbAudioSettings={settings.kweenBAudioSettings}
        />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SettingsPositioning
          updateRate={settings.positioningSettings.updateRate}
        />
      </TabPanel>
    </Z3Page>
  );
};
