import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "@components/Button";

/**
 * Types & Interfaces
 */

export interface NavigationButtonsProps {
  buttons: ReactElement<ButtonProps>[];
}

const NavigationButtonsWrapper = styled.div`
  display: flex;
`;

export const NavigationButtons = ({ buttons }: NavigationButtonsProps) => (
  <NavigationButtonsWrapper>
    {buttons.map((button) => button)}
  </NavigationButtonsWrapper>
);

export default NavigationButtons;
