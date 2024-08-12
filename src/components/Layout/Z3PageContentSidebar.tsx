import { PageSidebarProps } from "../Sidebar/PageSidebar";
import { Grid } from "@mui/material";
import { ReactElement } from "react";

export interface Z3PageSidebarProps {
  children?: React.ReactNode;
  pageSidebar: ReactElement<PageSidebarProps>;
}

export const Z3PageContentSidebar = ({
  pageSidebar,
  children,
}: Z3PageSidebarProps) => (
  <Grid container spacing={1}>
    <Grid item xs={12} md={4} lg={3} xl={2}>
      {pageSidebar}
    </Grid>
    <Grid item xs={12} md={8} lg={9} xl={10}>
      {children}
    </Grid>
  </Grid>
);
