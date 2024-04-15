import React, { useEffect } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { useAppContext, useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import ConnectBeesMenu from "@renderer/src/pages/Menu/ConnectBeesMenu";
import { Box, Divider, Typography } from "@mui/material";
import { Utils } from "@shared/utils";

export const Z3Navigation = () => {
  const { appContext } = useAppContext();
  const currentLatency = useAppStore((state) => state.currentLatency);
  const updateCurrentLatency = useAppStore(
    (state) => state.updateCurrentLatency
  );

  /**
   * Whenever we load the navigation, calculate the current latency
   */
  useEffect(() => {
    updateCurrentLatency();
  });

  /**
   * Init the buttons array (for Hub or P2P)
   */
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
      <Box display="flex" alignItems="center" gap={1}>
        {currentLatency !== 0 && (
          <>
            <Box
              style={{
                backgroundColor: "var(--primary-500)",
                paddingLeft: "10px",
                paddingRight: "10px",
                borderRadius: "var(--radiusMedium)",
                marginRight: "10px",
              }}
            >
              <Typography
                variant="small"
                color={
                  Utils.hasDecimals(currentLatency)
                    ? "var(--red-status)"
                    : "var(--text-color"
                }
              >
                Current latency is {currentLatency}ms
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
          </>
        )}
        <NavigationButtons buttons={buttons} />
      </Box>
    </Navigation>
  );
};
