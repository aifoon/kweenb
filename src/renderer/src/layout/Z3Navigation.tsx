import React, { useState } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { useAppContext } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import ConnectBeesMenu from "@renderer/src/layout/ConnectBeesMenu";

export const Z3Navigation = () => {
  const { appContext } = useAppContext();

  let buttons = [];

  if (appContext.appMode === AppMode.Hub) {
    buttons = [
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
      <ConnectBeesMenu key="connectBees" />,
    ];
  } else {
    buttons = [
      <Button
        key="disconnectBees"
        buttonSize={ButtonSize.Small}
        buttonType={ButtonType.TertiaryWhite}
        buttonUse={ButtonUse.Normal}
        onClick={() => appContext.setOpenDisconnectBeesModal(true)}
      >
        disconnect bees
      </Button>,
      <ConnectBeesMenu key="connectBees" />,
    ];
  }

  return (
    <Navigation fixedToTop height="var(--navigationHeight)">
      <NavigationButtons buttons={buttons} />
    </Navigation>
  );
};
