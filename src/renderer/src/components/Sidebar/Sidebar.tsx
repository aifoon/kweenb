import React from "react";
import styled from "styled-components";
import sidebarLogo from "../../images/sidebar-logo.png";
import { SidebarStatusBadge } from "./SidebarStatusBadge";

// interface NavigationProps {
//   // children?: ReactElement<NavigationButtonsProps>;
// }

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  height: 500px;
  box-shadow: var(--level-2);
  background-color: var(--primary-400);
`;

const SidebarBadgesWrapper = styled.div`
  margin: 2rem 0 3.5rem 0;
`;

const SidebarLogoWrapper = styled.div`
  text-align: center;
  opacity: 0.5;
`;

export const Sidebar = () => (
  <SidebarContainer>
    <div>
      <SidebarBadgesWrapper>
        <SidebarStatusBadge text="the kween" />
      </SidebarBadgesWrapper>
      <div>Navigation</div>
    </div>
    <SidebarLogoWrapper>
      <img src={sidebarLogo} alt="Sidebar Logo" />
    </SidebarLogoWrapper>
  </SidebarContainer>
);
