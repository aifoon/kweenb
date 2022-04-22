import { Grid } from "@mui/material";
import React from "react";

interface BeeConfigActionsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const BeeConfigActionsSection = ({
  title,
  children,
}: BeeConfigActionsSectionProps) => (
  <Grid container spacing={0}>
    <Grid item xs={12} md={6} lg={7} xl={9}>
      {title}
    </Grid>
    <Grid item xs={12} md={6} lg={5} xl={3}>
      {children}
    </Grid>
  </Grid>
);
