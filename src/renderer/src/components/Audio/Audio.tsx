import { Tab } from "@mui/material";
import React, { useState } from "react";
import { Tabs, TabPanel } from "@components/Tabs";
import { PageHeader } from "@components/PageHeader";
import { Z3Page } from "@components/Layout";
import { AudioMixer } from "./AudioMixer";
import { AudioTest } from "./AudioTest";
import { AudioFiles } from "./AudioFiles";
import { AudioTrigger } from "./AudioTrigger";

export const Audio = () => {
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
        <Tab label="Tests" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <AudioTrigger />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AudioFiles />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AudioMixer />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <AudioTest />
      </TabPanel>
    </Z3Page>
  );
};
