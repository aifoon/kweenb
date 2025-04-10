import React, { useCallback, useEffect, useState } from "react";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { Box, Button, Typography } from "@mui/material";
import { StreamingConnectionStatus } from "@shared/interfaces";
import { StreamingConnectionStatusType } from "@shared/enums";
import { IpcMessageEvent } from "electron";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";

interface ConnectBeesModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {
  type: "HUB" | "P2P" | "DISCONNECT" | "TRIGGER_ONLY";
}

const defaultStreamingConnectionStatus: StreamingConnectionStatus = {
  type: StreamingConnectionStatusType.IDLE,
  message: "",
};

export const ConnectBeesModal = ({
  open,
  onClose,
  type = "HUB",
}: ConnectBeesModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isConnecting, setIsConnecting] = useState(false);
  const [
    currentStreamingConnectionStatus,
    setCurrentStreamingConnectionStatus,
  ] = useState<StreamingConnectionStatus>(defaultStreamingConnectionStatus);

  /**
   * Subscribe to pozyx data when hook is mounted
   */
  useEffect(() => {
    const removeListener = window.kweenb.events.onStreamingConnectionStatus(
      (
        event: IpcMessageEvent,
        streamingConnectionStatus: StreamingConnectionStatus
      ) => {
        switch (streamingConnectionStatus.type) {
          case StreamingConnectionStatusType.SUCCES:
            setIsConnecting(false);
            setCurrentStreamingConnectionStatus(
              defaultStreamingConnectionStatus
            );
            onClose();
            break;
          case StreamingConnectionStatusType.ERROR:
            setIsConnecting(false);
            setCurrentStreamingConnectionStatus(streamingConnectionStatus);
            break;
          default:
            setCurrentStreamingConnectionStatus(streamingConnectionStatus);
            break;
        }
      }
    );
    return removeListener;
  }, []);

  const connectBees = useCallback(async () => {
    setIsConnecting(true);
    switch (type) {
      case "HUB":
        window.kweenb.methods.streaming.startHubStreaming();
        break;
      case "P2P":
        window.kweenb.methods.streaming.startP2PStreaming();
        break;
      case "DISCONNECT":
        window.kweenb.methods.streaming.startDisconnectStreaming();
        break;
      case "TRIGGER_ONLY":
        window.kweenb.methods.streaming.startTriggerOnlyStreaming();
        break;
      default:
        window.kweenb.methods.streaming.startHubStreaming();
        break;
    }
  }, [type]);

  useEffect(() => {
    setIsOpen(open);
    if (open) {
      connectBees();
    }
  }, [open]);

  return (
    <BaseModal
      disableBackdropClick={isConnecting}
      showCloseButton={false}
      open={isOpen}
      onClose={onClose}
    >
      <Box>
        {currentStreamingConnectionStatus.type ===
          StreamingConnectionStatusType.ERROR && (
          <Typography variant={"body2"} color={"error"}>
            {currentStreamingConnectionStatus.message}
          </Typography>
        )}
        {currentStreamingConnectionStatus.type ===
          StreamingConnectionStatusType.INFO && (
          <Typography variant={"body2"}>
            {currentStreamingConnectionStatus.message}
          </Typography>
        )}
      </Box>
      {currentStreamingConnectionStatus.type ===
        StreamingConnectionStatusType.ERROR && (
        <ConfirmModalFooter>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => onClose()}
          >
            Close
          </Button>
        </ConfirmModalFooter>
      )}
    </BaseModal>
  );
};
