import React, { useState } from "react";
import { Console } from "@components/Console";
import { Button, ButtonType, ButtonSize } from "@components/Buttons";
import { Card } from "@components/Cards";
import { useMqtt } from "@renderer/src/hooks/useMqtt";

interface BeeConfigLoggingProps {
  mqttTopic: string;
}

export const BeeConfigLogging = ({ mqttTopic = "" }: BeeConfigLoggingProps) => {
  const { mqttMessages, clearMessages } = useMqtt(mqttTopic);
  return (
    <Card
      title="Logging"
      hideFooterButtons={mqttMessages === ""}
      footerButtons={[
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          onClick={clearMessages}
        >
          Clear Console
        </Button>,
      ]}
    >
      {mqttMessages && (
        <Console height={450}>
          {mqttMessages.split("\n").map((i) => (
            <p>{i}</p>
          ))}
        </Console>
      )}
      {!mqttMessages && <Console height={450}>No logging available.</Console>}
    </Card>
  );
};
