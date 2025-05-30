import { BaseModal } from "@components/Modals/BaseModal";
import React, { useState, useEffect } from "react";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { Box, Button, ButtonGroup, TextField } from "@mui/material";
import { useAppPersistentStorage } from "../../hooks/useAppPersistentStorage";
import { modalWidth } from "./ModalConfig";

type SetSocketUrlProps = {
  open: boolean;
  onClose: () => void;
};

export const SetSocketUrl = ({ open, onClose }: SetSocketUrlProps) => {
  /**
   * Inner states
   */

  const [isOpen, setIsOpen] = useState(open);

  /**
   * Get states and functions from the useAppPersistentStorage hook
   */

  const socketUrl = useAppPersistentStorage((state) => state.socketUrl);
  const setSocketUrl = useAppPersistentStorage((state) => state.setSocketUrl);

  /**
   * When the open prop changes, update the inner state
   */

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <BaseModal
      width={modalWidth}
      onClose={onClose}
      title="Config Socket URL"
      open={isOpen}
    >
      <TextField
        autoFocus
        size="small"
        value={socketUrl}
        onChange={(e) => setSocketUrl(e.target.value)}
      />
      <ConfirmModalFooter>
        <Box justifyContent="flex-end">
          <ButtonGroup>
            <Button
              type="button"
              size="small"
              color="secondary"
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="small"
              color="primary"
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Reload Window
            </Button>
          </ButtonGroup>
        </Box>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
