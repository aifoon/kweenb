import { useState, MouseEvent } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button, Tooltip, Typography } from "@mui/material";
import { useAppStore } from "@renderer/src/hooks";

/**
 * The Connect button: stream to the bees, or only let them play their own
 * sounds when they are triggered
 */
export default function ConnectBeesMenu() {
  const setOpenConnectBeesModal = useAppStore(
    (state) => state.setOpenConnectBeesModal
  );
  const setOpenTriggerOnlyModal = useAppStore(
    (state) => state.setOpenTriggerOnlyModal
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const choose = (start: (open: boolean) => void) => {
    setAnchorEl(null);
    start(true);
  };

  return (
    <>
      <Button
        key="connectBees"
        variant="contained"
        size="small"
        color="secondary"
        onClick={(event: MouseEvent<HTMLButtonElement>) =>
          setAnchorEl(event.currentTarget)
        }
      >
        Connect
      </Button>
      <Menu
        id="connect-menu"
        anchorEl={anchorEl}
        sx={{ marginTop: "7px" }}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Tooltip
          title="Send the sound of your audio software to the bees. They can still play their own sounds when triggered."
          placement="left-start"
        >
          <MenuItem
            key="stream"
            onClick={() => choose(setOpenConnectBeesModal)}
          >
            <Typography variant="small">Stream to the bees</Typography>
          </MenuItem>
        </Tooltip>
        <Tooltip
          title="No stream: the bees only play their own sounds when triggered."
          placement="left-start"
        >
          <MenuItem
            key="trigger_only"
            onClick={() => choose(setOpenTriggerOnlyModal)}
          >
            <Typography variant="small">Trigger only</Typography>
          </MenuItem>
        </Tooltip>
      </Menu>
    </>
  );
}
