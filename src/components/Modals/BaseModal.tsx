import * as React from "react";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import styled from "styled-components";
import { CloseButton } from "./CloseButton";
import { close } from "fs";
import { Box } from "@mui/material";

export interface BaseModalProps {
  open: boolean;
  onClose?: any;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  width?: string;
  height?: string;
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
  background-color: rgba(0, 0, 0, 0.6);
  -webkit-tap-highlight-color: transparent;
`;

const ModalContentContainer = styled.div<{ width: string; height: string }>`
  position: relative;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: var(--primary-200);
  border-radius: var(--radiusMedium);
  padding: var(--modalPadding);
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
        height: 40px;
      `;
    }
    return `
        justify-content: flex-end;
      `;
  }}

  h6 {
    margin: 0;
  }
`;

export const BaseModal = ({
  title,
  open,
  onClose,
  children,
  showCloseButton = true,
  disableBackdropClick = false,
  width = "500px",
  height = "auto",
}: BaseModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown"
  ) => {
    if (disableBackdropClick && (reason == "backdropClick" || "escapeKeyDown"))
      return;
    closeModal();
  };

  const closeModal = () => {
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
      disableEscapeKeyDown
    >
      <Box style={{ position: "relative", outline: "none" }}>
        {showCloseButton && (
          <Box
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              zIndex: 999,
            }}
          >
            <CloseButton onClick={closeModal} />
          </Box>
        )}
        <ModalContentContainer width={width} height={height}>
          <ModalHeaderContainer hasTitle={!!title}>
            {title && <h6>{title}</h6>}
          </ModalHeaderContainer>
          <div>{children}</div>
        </ModalContentContainer>
      </Box>
    </BaseModalStyled>
  );
};
