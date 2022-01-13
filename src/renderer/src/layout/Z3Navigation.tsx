import React from "react";

import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Button";
import { Navigation, NavigationButtons } from "@components/Navigation";

export const Z3Navigation = () => (
  <Navigation fixedToTop height="var(--navigationHeight)">
    <NavigationButtons
      buttons={[
        <Button
          key="logging"
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.TertiaryWhite}
          buttonUse={ButtonUse.Normal}
          onClick={() => console.log("Clicking Logging")}
        >
          logging
        </Button>,
        <Button
          key="buildTheSwarmNest"
          buttonSize={ButtonSize.Small}
          buttonUse={ButtonUse.Accent}
          onClick={() => console.log("Clicking build the swarm nest")}
        >
          build the swarm nest
        </Button>,
      ]}
    />
  </Navigation>
);
