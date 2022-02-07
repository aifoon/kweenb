import React, { useState } from "react";
import { Console } from "@components/Console";
import { Button, ButtonType, ButtonSize } from "@components/Buttons";
import { Card } from "@components/Cards";

interface BeeConfigLoggingProps {
  logging?: string;
}

export const BeeConfigLogging = ({ logging = "" }: BeeConfigLoggingProps) => {
  const [currentLogging, setCurrentLogging] = useState<string>(logging);

  return (
    <Card
      title="Logging"
      hideFooterButtons={currentLogging === ""}
      footerButtons={[
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          onClick={() => setCurrentLogging("")}
        >
          Clear Console
        </Button>,
      ]}
    >
      {currentLogging && <Console height={450}>{currentLogging}</Console>}
      {!currentLogging && <Console height={450}>No logging available.</Console>}
    </Card>
  );
};
