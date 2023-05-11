import React, { useCallback, useState } from "react";
import { PageHeader } from "@components/PageHeader";
import { Z3Page } from "@renderer/src/layout";
import { Z3PageCentered } from "@renderer/src/layout/Z3PageCentered";
import { usePositioningStore } from "@renderer/src/hooks";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Tabs, TabPanel } from "@components/Tabs";
import { Tab } from "@mui/material";
import { PositioningMqttBrokerConnect } from "./PositioningMqttBrokerConnect";
import { PositioningData, PositioningRouting } from ".";
import { PositioningVolumes } from "./PositioningVolumes/PositioningVolumes";

export const Positioning = () => {
  const pozyxBrokerConnected = usePositioningStore(
    (state) => state.pozyxBrokerConnected
  );
  const pozyxBrokerDisconnect = usePositioningStore(
    (state) => state.pozyxBrokerDisconnect
  );
  const [value, setValue] = useState(0);

  const disconnectPozyxMqttBroker = useCallback(
    () => pozyxBrokerDisconnect(),
    []
  );

  const handleChange = async (
    event: React.SyntheticEvent<Element, Event>,
    newValue: any
  ) => {
    setValue(newValue);
  };

  return (
    <>
      {pozyxBrokerConnected && (
        <Z3Page
          pageHeader={
            <PageHeader
              title="Positioning"
              buttons={[
                <Button
                  key="disconnectPozyxMqttBroker"
                  buttonSize={ButtonSize.Small}
                  buttonUse={ButtonUse.Danger}
                  buttonType={ButtonType.Primary}
                  onClick={disconnectPozyxMqttBroker}
                >
                  Diconnect Pozyx MQTT
                </Button>,
              ]}
            />
          }
        >
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Data" />
            <Tab label="Routing" />
            <Tab label="Volumes" />
          </Tabs>
          <TabPanel value={value} index={0}>
            <PositioningData />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <PositioningRouting />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <PositioningVolumes />
          </TabPanel>
        </Z3Page>
      )}

      {!pozyxBrokerConnected && (
        <Z3PageCentered>
          <div style={{ width: "400px" }}>
            <PositioningMqttBrokerConnect />
          </div>
        </Z3PageCentered>
      )}
    </>
  );
};
