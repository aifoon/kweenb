import * as React from "react";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import styled from "styled-components";
import { CloseButton } from "./CloseButton";

export interface BaseModalProps {
  open: boolean;
  onClose?: any;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

const BaseModalStyled = styled(Modal)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled("div")`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.2);
  -webkit-tap-highlight-color: transparent;
`;

const ModalContentContainer = styled.div`
  width: 500px;
  background-color: var(--primary-200);
  border-radius: var(--radiusMedium);
  padding: 20px;
  &:focus-visible {
    outline: none;
  }
`;

const ModalHeaderContainer = styled.div<{
  hasTitle: boolean;
}>`
  display: flex;

  ${({ hasTitle }) => {
    if (hasTitle) {
      return `
        justify-content: space-between;
        margin-bottom: 20px;
      `;
    }
    return `
        justify-content: flex-end;
      `;
  }}

  h4 {
    margin: 0;
  }
`;

export const BaseModal = ({
  title,
  open,
  onClose,
  children,
  showCloseButton = true,
}: BaseModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <BaseModalStyled
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      slots={{ backdrop: Backdrop }}
      open={isOpen}
      onClose={handleClose}
    >
      <ModalContentContainer>
        <ModalHeaderContainer hasTitle={!!title}>
          {title && <h4>{title}</h4>}
          {showCloseButton && <CloseButton onClick={handleClose} />}
        </ModalHeaderContainer>
        <div>{children}</div>
      </ModalContentContainer>
    </BaseModalStyled>
  );
};
