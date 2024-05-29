import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "@components/Buttons/Button";
import { Box } from "@mui/material";

export interface PageSidebarProps {
  buttons?: ReactElement<ButtonProps>[];
  divider?: boolean;
}

export const PageSidebar = ({ buttons, divider = false }: PageSidebarProps) => (
  <Box
    display={"flex"}
    flexDirection={"column"}
    gap={1}
    borderRight={divider ? "1px solid var(--grey-300)" : "none"}
  >
    {buttons && <>{buttons.map((button) => button)}</>}
  </Box>
);
