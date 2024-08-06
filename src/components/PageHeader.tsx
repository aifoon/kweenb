import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "./Buttons/Button";
import { StatusBulletProps } from "./StatusBullet";
import { Box, Typography } from "@mui/material";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
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

export const PageHeader = ({
  title,
  buttons,
  subtitle = "",
}: PageHeaderProps) => (
  <PageHeaderWrapper>
    <h3>{title}</h3>
    <Box display="flex" alignItems="center" gap={2}>
      {subtitle && <Typography variant="small">{subtitle}</Typography>}
      <Box display={"flex"} alignItems={"center"} gap={2}>
        {buttons}
      </Box>
    </Box>
  </PageHeaderWrapper>
);
