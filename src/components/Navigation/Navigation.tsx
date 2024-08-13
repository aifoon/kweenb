import React, { ReactElement } from "react";
import styled from "styled-components";
import { NavigationButtonsProps } from "./NavigationButtons";
import { NavigationLogo } from "./NavigationLogo";
import { Box } from "@mui/material";

interface NavigationProps {
  title: string;
  children?: ReactElement<NavigationButtonsProps>;
  fixedToTop?: boolean;
  height?: string;
  onLogoClick?: () => void;
}

const NavigationContainer = styled.nav<
  Omit<NavigationProps, "children" | "title">
>`
  display: grid;
  grid-template-columns: 1fr 2fr;
  justify-content: space-between;
  height: ${({ height }) => height};
  ${({ fixedToTop }) => {
    if (fixedToTop)
      return `
      position: fixed;
      top: 0;
      left: 0;
    `;
    return "";
  }}
  align-items: center;
  width: 100%;
  padding: 1rem 2rem 1rem 2rem;
  height: var(--navigationHeight);
  box-shadow: var(--level-2);
  background-color: var(--primary-400);
  border-bottom: 1px solid var(--primary-200);
  overflow: hidden;
  z-index: 999;

  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    padding: var(--contentPaddingMobileTop) var(--contentPaddingMobileLeft)
      var(--contentPaddingMobileBottom) var(--contentPaddingMobileRight);
  }
`;

export const Navigation = ({
  title = "",
  children,
  height = "75px",
  fixedToTop = false,
  onLogoClick = () => {},
}: NavigationProps) => (
  <NavigationContainer height={height} fixedToTop={fixedToTop}>
    <NavigationLogo onClick={onLogoClick} title={title} />
    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
      {children}
    </Box>
  </NavigationContainer>
);
