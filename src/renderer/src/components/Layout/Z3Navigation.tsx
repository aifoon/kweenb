import React, { useEffect } from "react";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import ConnectBeesMenu from "@renderer/src/components/Menu/ConnectBeesMenu";
import { Box, Divider, Typography, Button } from "@mui/material";
import styled from "styled-components";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const Pill = styled(Typography)`
  background-color: var(--primary-500);
  padding-left: 10px;
  padding-right: 10px;
  border-radius: var(--radiusMedium);
  color: var(--grey-500);
`;

export const Z3Navigation = () => {
  // App Store
  const setOpenDisconnectBeesModal = useAppStore(
    (state) => state.setOpenDisconnectBeesModal
  );
  const setOpenBeeDeviceManagerModal = useAppStore(
    (state) => state.setOpenBeeDeviceManagerModal
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
      variant="text"
      size="small"
      color="secondary"
      onClick={() => setOpenDisconnectBeesModal(true)}
    >
      disconnect
    </Button>,
    <ConnectBeesMenu key="connectBees" />,
    <Button
      key="beeDeviceManager"
      variant="text"
      size="small"
      color="secondary"
      onClick={() => setOpenBeeDeviceManagerModal(true)}
    >
      <PowerSettingsNewIcon />
    </Button>,
  ];

  return (
    <Navigation title="kweenb" fixedToTop height="var(--navigationHeight)">
      <Box display="flex" alignItems="center" gap={1}>
        {currentLatency !== 0 && (
          <>
            <Box display={"flex"} gap={1}>
              <Pill variant="small">
                {appMode === AppMode.Hub ? "HUB" : "P2P"}
              </Pill>
              <Pill variant="small">
                Streaming latency is {currentLatency}ms
              </Pill>
            </Box>
            <Divider orientation="vertical" flexItem />
          </>
        )}
        <NavigationButtons buttons={buttons} />
      </Box>
    </Navigation>
  );
};
