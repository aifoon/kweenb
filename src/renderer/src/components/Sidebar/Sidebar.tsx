import React, { ReactElement } from "react";
import styled from "styled-components";
import sidebarLogo from "../../images/sidebar-logo.png";
import { SidebarButtonProps } from "./SidebarButton";
import { SidebarBadgeProps } from "./SidebarStatusBadge";

interface SidebarProps {
  badges?: ReactElement<SidebarBadgeProps>[];
  buttons?: ReactElement<SidebarButtonProps>[];
  width?: string;
  height?: string;
  fixedToSide?: boolean;
}

const SidebarContainer = styled.aside<SidebarProps>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 50px 20px 20px 20px;
  box-shadow: var(--level-2);
  background-color: var(--primary-400);
  ${({ fixedToSide }) => {
    if (fixedToSide) {
      return `
        position: fixed;
        left: 0;
        bottom: 0;
      `;
    }
    return "";
  }}
  ${({ width }) => `width: ${width}` || ""};
  ${({ height }) => `height: ${height}` || ""};
`;

const SidebarBadgesWrapper = styled.div`
  margin-bottom: 3.5rem;
  button + button {
    margin-top: 20px;
  }
`;

const SidebarButtonsWrapper = styled.div`
  button + button {
    margin-top: 20px;
  }
`;

const SidebarLogoWrapper = styled.div`
  text-align: center;
  opacity: 0.5;
`;

export const Sidebar = ({
  badges,
  buttons,
  width = "200px",
  height = "200px",
  fixedToSide = false,
}: SidebarProps) => (
  <SidebarContainer width={width} height={height} fixedToSide={fixedToSide}>
    <div>
      {badges && badges.length > 0 && (
        <SidebarBadgesWrapper>
          {badges.map((badge) => badge)}
        </SidebarBadgesWrapper>
      )}
      {buttons && buttons.length && (
        <SidebarButtonsWrapper>
          {buttons.map((button) => button)}
        </SidebarButtonsWrapper>
      )}
    </div>
    <SidebarLogoWrapper>
      <img src={sidebarLogo} alt="Sidebar Logo" />
    </SidebarLogoWrapper>
  </SidebarContainer>
);
