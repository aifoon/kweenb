import { Loader } from "@components/Loader";
import { Tab } from "@mui/material";
import { useSettings, useAppContext } from "@renderer/src/hooks";
import React, { useState } from "react";
import { Tabs, TabPanel } from "@components/Tabs";
import { AppMode } from "@shared/enums";
import { PageHeader } from "../../components/PageHeader";
import { Z3Page } from "../../layout";
import { AudioMixer } from "./AudioMixer";

export const Audio = () => {
  const { appContext } = useAppContext();
  const [value, setValue] = useState(0);

  const handleChange = async (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any
  ) => {
    setValue(newValue);
  };

  return (
    <Z3Page pageHeader={<PageHeader title="Audio" />}>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Trigger" />
        <Tab label="Files" />
        <Tab label="Mixer" />
      </Tabs>
      <TabPanel value={value} index={0}>
        Trigger
      </TabPanel>
      <TabPanel value={value} index={1}>
        Files
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AudioMixer />
      </TabPanel>
    </Z3Page>
  );
};
