import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Utils } from "@shared/utils";
import { BeeDeviceManagerActions } from "@shared/enums";

interface BeeDeviceManagerModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const BeeDeviceManagerModal = ({
  open,
  onClose,
}: BeeDeviceManagerModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleRebootAllBees = async () => {
    setIsProcessing(true);
    setActionStatus("Rebooting all bees...");

    try {
      // Empty array will result in all bees being managed
      await window.kweenb.methods.manageBeeDevice(
        [],
        BeeDeviceManagerActions.REBOOT
      );
      setActionStatus("Triggered all bees to reboot...");
    } catch (error) {
      if (error instanceof Error) {
        setActionStatus(`${error.message}`);
      } else {
        setActionStatus(`Error: ${String(error)}`);
      }
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setActionStatus(null);
        onClose();
      }, 2000);
    }
  };

  const handleShutdownAllBees = async () => {
    setIsProcessing(true);
    setActionStatus("Shutting down all bees...");

    try {
      // Empty array will result in all bees being managed
      await window.kweenb.methods.manageBeeDevice(
        [],
        BeeDeviceManagerActions.SHUTDOWN
      );
      setActionStatus(
        "Triggered all bees to shutdown. Wait a couple of seconds to switch off battery..."
      );
    } catch (error) {
      if (error instanceof Error) {
        setActionStatus(`${error.message}`);
      } else {
        setActionStatus(`Error: ${String(error)}`);
      }
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setActionStatus(null);
        onClose();
      }, 2000);
    }
  };

  return (
    <BaseModal
      disableBackdropClick={isProcessing}
      open={isOpen}
      onClose={onClose}
      showCloseButton={false}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {!isProcessing ? (
          <>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap={2}
            >
              <Typography variant="h6">KweenB</Typography>
              <Button
                key={Utils.generateUniqueIdForReactComponents()}
                onClick={() => window.kweenb.actions.closeKweenB()}
                variant="contained"
                size="small"
                color="primary"
              >
                Close KweenB
              </Button>
              <Typography variant="h6">Bees</Typography>
              <Button
                key={Utils.generateUniqueIdForReactComponents()}
                onClick={handleRebootAllBees}
                variant="contained"
                size="small"
                color="primary"
              >
                Reboot all bees
              </Button>
              <Button
                key={Utils.generateUniqueIdForReactComponents()}
                onClick={handleShutdownAllBees}
                color="error"
                variant="contained"
                size="small"
              >
                Shutdown all bees
              </Button>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Typography variant="small" align="center">
              {actionStatus}
            </Typography>
          </Box>
        )}
      </Box>
    </BaseModal>
  );
};
