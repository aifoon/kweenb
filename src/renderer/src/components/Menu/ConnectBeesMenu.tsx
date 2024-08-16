import { useState, MouseEvent, useCallback } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button, ButtonSize, ButtonUse } from "@components/Buttons";
import { Box, Tooltip, Typography } from "@mui/material";
import { useAppStore } from "@renderer/src/hooks";
import { IAudioPreset } from "@shared/interfaces";
import Divider from "@mui/material/Divider";
import { AppMode } from "@shared/enums";
import { ToastMessage } from "../../interfaces";

export default function ConnectBeesMenu() {
  // App Store
  const updateCurrentLatency = useAppStore(
    (state) => state.updateCurrentLatency
  );
  const setOpenConnectBeesP2PModal = useAppStore(
    (state) => state.setOpenConnectBeesP2PModal
  );
  const setOpenConnectBeesHubModal = useAppStore(
    (state) => state.setOpenConnectBeesHubModal
  );
  const setOpenTriggerOnlyModal = useAppStore(
    (state) => state.setOpenTriggerOnlyModal
  );
  const appMode = useAppStore((state) => state.appMode);
  const showToast = useAppStore((state) => state.showToast);

  // Internal state
  const [currentPresets, setCurrentPresets] = useState<IAudioPreset[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * Activate a preset (by setting settings) and start the connection
   */
  const activatePresetAndStart = async (fileName: string) => {
    // activate the preset
    const activatePresetError = await window.kweenb.methods.activatePreset(
      fileName
    );

    // check if there was an error
    if (activatePresetError.message !== "") {
      showToast({ message: activatePresetError.message, severity: "error" });
      return;
    }

    // because we changed the preset, we need to update the latency
    updateCurrentLatency();

    // hide the menu
    setAnchorEl(null);

    // open the connections
    startProcess();
  };

  /**
   * Close the menu
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Get current audio presets and show them in the menu
   * @param event
   */
  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    // get the presets
    window.kweenb.methods.getAudioPresets(appMode).then((presets) => {
      console.log(presets);
      setCurrentPresets(presets);
    });

    // set the anchor element
    setAnchorEl(event.currentTarget);
  };

  /**
   * Start the process
   */
  const startProcess = () => {
    if (appMode === AppMode.P2P) {
      setOpenConnectBeesP2PModal(true);
    } else {
      setOpenConnectBeesHubModal(true);
    }
  };

  /**
   * Start without a preset
   */
  const startWithoutPreset = () => {
    setAnchorEl(null);
    startProcess();
  };

  /**
   * Trigger only
   */
  const startTriggerOnly = useCallback(() => {
    setAnchorEl(null);
    setOpenTriggerOnlyModal(true);
  }, []);

  return (
    <div>
      <Button
        key="connectBees"
        buttonSize={ButtonSize.Small}
        buttonUse={ButtonUse.Grey}
        onClick={openMenu}
      >
        Connect
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        sx={{ marginTop: "7px" }}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Box padding={"0 16px"}>
          <Typography
            variant="extraSmall"
            style={{ textTransform: "uppercase" }}
            color={{ color: "var(--grey-400)" }}
          >
            Triggering
          </Typography>
        </Box>
        <MenuItem key="trigger_only" onClick={startTriggerOnly}>
          <Typography variant="small">Trigger only</Typography>
        </MenuItem>
        <Divider />
        <Box padding={"0 16px"}>
          <Typography
            variant="extraSmall"
            style={{ textTransform: "uppercase" }}
            color={{ color: "var(--grey-400)" }}
          >
            Streaming
          </Typography>
        </Box>
        <MenuItem key="current_settings" onClick={startWithoutPreset}>
          <Typography variant="small">Current settings</Typography>
        </MenuItem>
        {currentPresets.map((preset) => (
          <Tooltip
            key={`tooltip_${preset.name}`}
            title={`${preset.description}. Latency: ${preset.latency}ms.`}
            placement="left-start"
          >
            <MenuItem
              key={preset.name}
              onClick={() => activatePresetAndStart(preset.fileName)}
            >
              <Typography variant="small">{preset.name}</Typography>
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>
    </div>
  );
}
