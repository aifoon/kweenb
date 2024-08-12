import * as React from "react";
import { useState, useCallback } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button, ButtonSize, ButtonUse } from "@components/Buttons";
import { Box, Tooltip, Typography } from "@mui/material";
import { useAppContext, useAppStore } from "@renderer/src/hooks";
import { IAudioPreset } from "@shared/interfaces";
import Divider from "@mui/material/Divider";

export default function ConnectBeesMenu() {
  const [currentPresets, setCurrentPresets] = useState<IAudioPreset[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { appContext } = useAppContext();
  const updateCurrentLatency = useAppStore(
    (state) => state.updateCurrentLatency
  );

  // handle click event
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    // get the presets
    window.kweenb.methods.getAudioPresets().then((presets) => {
      setCurrentPresets(presets);
    });

    // set the anchor element
    setAnchorEl(event.currentTarget);
  };

  // handle close event
  const activatePresetAndStart = useCallback(async (fileName: string) => {
    // activate the preset
    await window.kweenb.methods.activatePreset(fileName);

    // because we changed the preset, we need to update the latency
    updateCurrentLatency();

    // hide the menu
    setAnchorEl(null);

    // open the connections
    appContext.setOpenConnectBeesModal(true);
  }, []);

  // handle start without preset
  const startWithoutPreset = useCallback(() => {
    setAnchorEl(null);
    appContext.setOpenConnectBeesModal(true);
  }, []);

  // handle trigger only
  const startTriggerOnly = useCallback(() => {
    setAnchorEl(null);
    appContext.setOpenTriggerOnlyModal(true);
  }, []);

  // handle close when clicking outside
  const handleClose = () => {
    setAnchorEl(null);
  };

  // return the components-
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
