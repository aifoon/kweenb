import React from "react";
import { Button, ButtonSize, ButtonUse } from "@components/Buttons/Button";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { useAppContext } from "@renderer/src/hooks";

export const Z3Navigation = () => {
  const { appContext } = useAppContext();

  return (
    <Navigation fixedToTop height="var(--navigationHeight)">
      <NavigationButtons
        buttons={[
          <Button
            key="buildHive"
            buttonSize={ButtonSize.Small}
            buttonUse={ButtonUse.Accent}
            onClick={() => appContext.setOpenBuildSwarmModal(true)}
          >
            build hive
          </Button>,
        ]}
      />
    </Navigation>
  );
};
