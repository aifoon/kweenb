import { Loader } from "@components/Loader";
import { Tab } from "@mui/material";
import { useSettings, useAppContext } from "@renderer/src/hooks";
import React, { useState } from "react";
import { Tabs, TabPanel } from "@components/Tabs";
import { AppMode } from "@shared/enums";
import { PageHeader } from "../../components/PageHeader";
import { Z3Page } from "../../layout";
import { SettingsBees } from "./SettingsBees";
import { SettingsKweenB } from "./SettingsKweenB";
import { SettingsTheKween } from "./SettingsTheKween";

export const Settings = () => {
  const { loading, settings, reloadSettings } = useSettings();
  const { appContext } = useAppContext();
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
        {appContext.appMode === AppMode.Hub && <Tab label="The Kween" />}
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
      {appContext.appMode === AppMode.Hub && (
        <TabPanel value={value} index={2}>
          <SettingsTheKween ipAddress={settings.theKweenSettings.ipAddress} />
        </TabPanel>
      )}
    </Z3Page>
  );
};
