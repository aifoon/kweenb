import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "@renderer/src/components/Buttons/Button";
import { ButtonGroup } from "../Buttons/ButtonGroup";

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
    <ButtonGroup>{buttons.map((button) => button)}</ButtonGroup>
  </NavigationButtonsWrapper>
);

export default NavigationButtons;
