import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "./Buttons/Button";
import { StatusBulletProps } from "./StatusBullet";
import { ButtonGroup, ToggleButton, ToggleButtonGroup } from "@mui/material";
// import { ButtonGroup } from "./Buttons";
import ViewListIcon from "@mui/icons-material/ViewList";

export interface PageHeaderProps {
  title: string;
  buttons?: ReactElement;
  secondaryButtons?: ReactElement<ButtonProps>[];
  statusBullet?: ReactElement<StatusBulletProps>;
}

const PageHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--pageTitleMargin);
  & > h3 {
    margin: 0;
  }
`;

const PageHeaderActions = styled.div`
  display: flex;
  align-items: center;
  div + div {
    margin-left: 20px;
  }
`;

export const PageHeader = ({
  title,
  buttons,
  statusBullet,
}: PageHeaderProps) => (
  <PageHeaderWrapper>
    <h3>{title}</h3>
    <PageHeaderActions>{buttons}</PageHeaderActions>
  </PageHeaderWrapper>
);
