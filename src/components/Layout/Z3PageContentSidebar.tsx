import { PageSidebarProps } from "../Sidebar/PageSidebar";
import { Grid } from "@mui/material";
import { ReactElement } from "react";

import {
  SimpleTreeView,
  SimpleTreeViewProps,
} from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeViewProps } from "@mui/x-tree-view";
import { SimpleTreeviewSidebarProps } from "@components/Sidebar/SimpleTreeviewSidebar";

export interface Z3PageSidebarProps {
  children?: React.ReactNode;
  sidebar:
    | ReactElement<PageSidebarProps>
    | ReactElement<SimpleTreeviewSidebarProps>;
  treeView?: ReactElement<SimpleTreeViewProps<any>>;
}

export const Z3PageContentSidebar = ({
  sidebar,
  children,
}: Z3PageSidebarProps) => (
  <Grid container spacing={1}>
    <Grid item xs={12} md={4} lg={3} xl={2}>
      {sidebar}
    </Grid>
    <Grid item xs={12} md={8} lg={9} xl={10}>
      {children}
    </Grid>
  </Grid>
);
