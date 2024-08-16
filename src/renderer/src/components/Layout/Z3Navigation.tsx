import React, { useEffect } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import ConnectBeesMenu from "@renderer/src/components/Menu/ConnectBeesMenu";
import { Box, Divider, Typography } from "@mui/material";

export const Z3Navigation = () => {
  // App Store
  const setOpenDisconnectBeesModal = useAppStore(
    (state) => state.setOpenDisconnectBeesModal
  );
  const setOpenConnectBeesHubModal = useAppStore(
    (state) => state.setOpenConnectBeesHubModal
  );
  const currentLatency = useAppStore((state) => state.currentLatency);
  const appMode = useAppStore((state) => state.appMode);
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
  let buttons = [
    <Button
      key="disconnectBees"
      buttonSize={ButtonSize.Small}
      buttonType={ButtonType.TertiaryWhite}
      buttonUse={ButtonUse.Normal}
      onClick={() => setOpenDisconnectBeesModal(true)}
    >
      disconnect
    </Button>,
  ];
  if (appMode === AppMode.Hub) {
    buttons.push(
      <Button
        key="buildHive"
        buttonSize={ButtonSize.Small}
        buttonUse={ButtonUse.Grey}
        onClick={() => setOpenConnectBeesHubModal(true)}
      >
        build hive
      </Button>,
      <ConnectBeesMenu key="connectBees" />
    );
  } else {
    buttons.push(<ConnectBeesMenu key="connectBees" />);
  }

  return (
    <Navigation title="kweenb" fixedToTop height="var(--navigationHeight)">
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
              <Typography variant="small" color="var(--grey-500)">
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
