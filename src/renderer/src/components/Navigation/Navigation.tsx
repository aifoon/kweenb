import React, { ReactElement } from "react";
import styled from "styled-components";
import { NavigationButtonsProps } from "./NavigationButtons";
import { NavigationLogo } from "./NavigationLogo";

interface NavigationProps {
  children?: ReactElement<NavigationButtonsProps>;
  fixedToTop?: boolean;
  height?: string;
}

const NavigationContainer = styled.nav<Omit<NavigationProps, "children">>`
  display: flex;
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
  height: 75px;
  box-shadow: var(--level-2);
  background-color: var(--primary-400);
  border-bottom: 1px solid var(--primary-200);
  overflow: hidden;
`;

export const Navigation = ({
  children,
  height = "75px",
  fixedToTop = false,
}: NavigationProps) => (
  <NavigationContainer height={height} fixedToTop={fixedToTop}>
    <NavigationLogo />
    {children}
  </NavigationContainer>
);
