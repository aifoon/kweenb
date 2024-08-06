import React from "react";
import styled from "styled-components";
import CloseIcon from "@mui/icons-material/Close";

interface CloseButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const CloseButtonWrapper = styled.button`
  border: none;
  background: none;
  margin: 0;
  padding: 0;
  color: var(--white);
`;

export const CloseButton = ({ onClick }: CloseButtonProps) => (
  <CloseButtonWrapper onClick={onClick}>
    <CloseIcon />
  </CloseButtonWrapper>
);
