import { version } from "os";
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
  versionNumber?: string;
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
  display: flex;
  flex-direction: column;
  text-align: center;
  opacity: 0.5;
  & > img {
    width: 80px;
  }
  & > .version {
    font-size: 0.8rem;
  }
`;

export const Sidebar = ({
  badges,
  buttons,
  width = "200px",
  height = "200px",
  fixedToSide = false,
  versionNumber = "",
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
      <div>
        <img src={sidebarLogo} alt="Sidebar Logo" />
      </div>
      {versionNumber && <div className="version">v{versionNumber}</div>}
    </SidebarLogoWrapper>
  </SidebarContainer>
);
