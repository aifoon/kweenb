import { BaseModal } from "@components/Modals/BaseModal";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { IRemoteInterface } from "@shared/interfaces";

type RemoteInterfaceModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Where the remote interface can be opened: a QR code for a phone or tablet
 * and a button for the browser of this computer
 */
export const RemoteInterfaceModal = ({
  open,
  onClose,
}: RemoteInterfaceModalProps) => {
  const [remoteInterface, setRemoteInterface] =
    useState<IRemoteInterface | null>(null);

  // the address can change (another network), so it is asked every time
  useEffect(() => {
    if (!open) return;
    setRemoteInterface(null);
    window.kweenb.methods
      .getRemoteInterface()
      .then(setRemoteInterface)
      .catch(() =>
        setRemoteInterface({
          localUrl: "http://localhost:5050",
          networkUrl: null,
          qrCode: null,
        })
      );
  }, [open]);

  return (
    <BaseModal title="Remote interface" open={open} onClose={onClose}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="small">
          Trigger scenes and set the volume of the bees from a phone or tablet.
          The device has to be on the same network as this computer, and KweenB
          has to stay open.
        </Typography>

        {remoteInterface?.networkUrl && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            {remoteInterface.qrCode && (
              <img
                src={remoteInterface.qrCode}
                alt="QR code of the remote interface"
                width={220}
                height={220}
                style={{ borderRadius: "var(--radiusMedium)" }}
              />
            )}
            <Typography variant="small">
              Scan the code with the camera, or type this in the browser:
            </Typography>
            <Typography style={{ userSelect: "text", fontWeight: 600 }}>
              {remoteInterface.networkUrl}
            </Typography>
          </Box>
        )}

        {remoteInterface && !remoteInterface.networkUrl && (
          <Typography variant="small">
            This computer is not on a network right now, so a phone cannot reach
            it. Connect to the network of the swarm and open this again.
          </Typography>
        )}
      </Box>
      <ConfirmModalFooter>
        <Button
          type="button"
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.TertiaryWhite}
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          type="button"
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Normal}
          onClick={() => window.kweenb.methods.openRemoteInterface()}
        >
          Open on this computer
        </Button>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
