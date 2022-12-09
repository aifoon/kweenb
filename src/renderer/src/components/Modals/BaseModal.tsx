import * as React from "react";
import { useState, useEffect } from "react";
import ModalUnstyled from "@mui/base/ModalUnstyled";
import styled from "styled-components";
import { CloseButton } from "./CloseButton";

export interface BaseModalProps {
  open: boolean;
  onClose?: any;
  children: React.ReactNode;
  title?: string;
}

const BaseModalStyled = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  &:focus-visible {
    outline: none;
  }
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
          <CloseButton onClick={handleClose} />
        </ModalHeaderContainer>
        <div>{children}</div>
      </ModalContentContainer>
    </BaseModalStyled>
  );
};
