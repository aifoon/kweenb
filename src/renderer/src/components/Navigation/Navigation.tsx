import React, { ReactElement } from "react";
import styled from "styled-components";
import { NavigationButtonsProps } from "./NavigationButtons";
import { NavigationLogo } from "./NavigationLogo";

interface NavigationProps {
  children?: ReactElement<NavigationButtonsProps>;
}

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 2rem 1rem 2rem;
  height: 75px;
  box-shadow: var(--level-2);
  background-color: var(--primary-400);
  button + button {
    margin-left: 20px;
  }
`;

export const Navigation = ({ children }: NavigationProps) => (
  <NavigationContainer>
    <NavigationLogo />
    {children}
  </NavigationContainer>
);
