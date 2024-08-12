import { ButtonGroup } from "../Buttons";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, ButtonUse, ButtonType } from "../Buttons/Button";
import { BaseModal, BaseModalProps } from "./BaseModal";

interface ConfirmModalProps extends Pick<BaseModalProps, "open" | "onClose"> {
  message: string;
  title?: string;
  onConfirm: () => void;
}

export const ConfirmModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--grey-300);
`;

export const ConfirmModal = ({
  open,
  onClose,
  message,
  title,
  onConfirm,
}: ConfirmModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  useEffect(() => setIsOpen(open), [open]);
  return (
    <BaseModal title={title} open={isOpen} onClose={() => onClose()}>
      <p>{message}</p>
      <ConfirmModalFooter>
        <ButtonGroup>
          <Button
            buttonUse={ButtonUse.Normal}
            buttonType={ButtonType.TertiaryWhite}
            onClick={() => onClose()}
          >
            No
          </Button>
          <Button
            buttonUse={ButtonUse.Normal}
            buttonType={ButtonType.Primary}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes
          </Button>
        </ButtonGroup>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
