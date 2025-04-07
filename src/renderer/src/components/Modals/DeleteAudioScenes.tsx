import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { Form } from "formik";
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonType,
  ButtonUse,
} from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { CustomSwitch } from "@components/Forms/CustomSwitch";

interface DeleteAudioScenesProps
  extends Pick<BaseModalProps, "open" | "onClose"> {
  onConfirm: (deleteOnAllBees: boolean) => void;
}

export const DeleteAudioScenes = ({
  open,
  onClose,
  onConfirm,
}: DeleteAudioScenesProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [deleteOnAllBees, setDeleteOnAllBees] = useState(false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <BaseModal disableBackdropClick open={isOpen} onClose={onClose}>
      <form>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            marginTop: 3,
          }}
        >
          <Typography variant="small">Delete on all bees</Typography>
          <CustomSwitch
            checked={deleteOnAllBees}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDeleteOnAllBees(event.target.checked)
            }
          />
        </Box>
        <ConfirmModalFooter>
          <Box justifyContent="flex-end">
            <ButtonGroup>
              <Button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  setIsOpen(false);
                }}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => onConfirm(deleteOnAllBees)}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Remove Scene(s)
              </Button>
            </ButtonGroup>
          </Box>
        </ConfirmModalFooter>
      </form>
    </BaseModal>
  );
};
