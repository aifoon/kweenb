import React from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { useAppContext } from "@renderer/src/hooks";

export const Z3Navigation = () => {
  const { appContext } = useAppContext();

  return (
    <Navigation fixedToTop height="var(--navigationHeight)">
      <NavigationButtons
        buttons={[
          <Button
            key="cleanHive"
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.TertiaryWhite}
            buttonUse={ButtonUse.Normal}
            onClick={() => appContext.setOpenCleanSwarmModal(true)}
          >
            clean hive
          </Button>,
          <Button
            key="buildHive"
            buttonSize={ButtonSize.Small}
            buttonUse={ButtonUse.Grey}
            onClick={() => appContext.setOpenBuildSwarmModal(true)}
          >
            build hive
          </Button>,
        ]}
      />
    </Navigation>
  );
};
