import { PageSidebarProps } from "@components/Sidebar/PageSidebar";
import { Grid } from "@mui/material";
import { ReactElement } from "react";
import styled from "styled-components";

export interface Z3PageSidebarProps {
  children?: React.ReactNode;
  pageSidebar: ReactElement<PageSidebarProps>;
}

const Z3PageContentSidebarWrapper = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 175px 1fr;
  grid-gap: var(--contentPaddingLeft);
`;

export const Z3PageContentSidebar = ({
  pageSidebar,
  children,
}: Z3PageSidebarProps) => (
  <Grid container spacing={1}>
    <Grid item xs={12} md={3} lg={2} xl={1}>
      {pageSidebar}
    </Grid>
    <Grid item xs={12} md={9} lg={10} xl={11}>
      {children}
    </Grid>
  </Grid>
);
