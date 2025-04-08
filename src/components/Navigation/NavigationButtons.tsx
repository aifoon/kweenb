import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "../Buttons/Button";
import { Box } from "@mui/material";

/**
 * Types & Interfaces
 */

export interface NavigationButtonsProps {
  buttons: ReactElement<ButtonProps>[];
}

export const NavigationButtons = ({ buttons }: NavigationButtonsProps) => (
  <>
    <Box display="flex" gap={1}>
      {buttons.map((button) => button)}
    </Box>
  </>
);

export default NavigationButtons;
