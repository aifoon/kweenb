import { PageSidebarProps } from "@components/Sidebar/PageSidebar";
import { ReactElement } from "react";
import styled from "styled-components";

export interface Z3PageSidebarProps {
  children?: React.ReactNode;
  pageSidebar: ReactElement<PageSidebarProps>;
}

const Z3PageContentSidebarWrapper = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 250px 1fr;
  grid-gap: var(--contentPaddingLeft);
`;

export const Z3PageContentSidebar = ({
  pageSidebar,
  children,
}: Z3PageSidebarProps) => (
  <Z3PageContentSidebarWrapper>
    {pageSidebar}
    <div>{children}</div>
  </Z3PageContentSidebarWrapper>
);
