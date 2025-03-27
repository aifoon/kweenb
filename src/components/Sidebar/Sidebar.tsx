import React, { ReactElement } from "react";
import styled from "styled-components";
import sidebarLogo from "../images/sidebar-logo.png";
import { SidebarButtonProps } from "./SidebarButton";
import { SidebarBadgeProps } from "./SidebarStatusBadge";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { HAS_CONNECTION_WITH_PHYSICAL_SWARM } from "@shared/consts";
import kweenb from "preload/src/methods/kweenb";

interface SidebarProps {
  badges?: ReactElement<SidebarBadgeProps>[];
  buttons?: ReactElement<SidebarButtonProps>[];
  width?: string;
  height?: string;
  fixedToSide?: boolean;
  collapseble?: boolean;
}

const SidebarWrapper = styled.div<SidebarProps>`
  position: relative;
  padding: 30px 20px;
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

const SidebarCollapseButtonContainer = styled.div<SidebarProps>`
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  ${({ collapseble }) => (collapseble ? `display: flex;` : `display: none;`)}
`;

const SidebarCollapseButton = styled.button`
  background-color: var(--primary-200);
  height: 35px;
  width: 35px;
  font-size: 5px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SidebarContainer = styled.aside<SidebarProps>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  ${({ collapseble }) =>
    collapseble
      ? `grid-template-rows: 50px 1fr 100px;`
      : `grid-template-rows: 1fr 100px;`}
  height: 100%;
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

const SidebarLogoWrapper = styled.div<{
  hasConnectionWithPhysicalSwarm?: boolean;
}>`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  opacity: 0.5;
  & > img {
    width: 80px;
  }
  ${({ hasConnectionWithPhysicalSwarm }) =>
    hasConnectionWithPhysicalSwarm
      ? `flex-direction: auto;
        align-items: flex-end;`
      : `
        flex-direction: column;
        align-items: center;
        & > .kweenb-state {
          font-size: 0.8rem;
          text-align: center;
    `}}
`;

export const Sidebar = ({
  badges,
  buttons,
  collapseble = false,
  width = "200px",
  height = "200px",
  fixedToSide = false,
}: SidebarProps) => (
  <SidebarWrapper width={width} height={height} fixedToSide={fixedToSide}>
    <SidebarContainer collapseble={collapseble}>
      <SidebarCollapseButtonContainer collapseble={collapseble}>
        <SidebarCollapseButton>
          <MenuOpenIcon style={{ fontSize: ".9rem" }} />
        </SidebarCollapseButton>
      </SidebarCollapseButtonContainer>
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
      <SidebarLogoWrapper
        hasConnectionWithPhysicalSwarm={HAS_CONNECTION_WITH_PHYSICAL_SWARM}
      >
        <div>
          <img src={sidebarLogo} alt="Sidebar Logo" />
        </div>
        {!HAS_CONNECTION_WITH_PHYSICAL_SWARM && (
          <div className="kweenb-state">NO CONNECTION TO PHYSICAL SWARM</div>
        )}
      </SidebarLogoWrapper>
    </SidebarContainer>
  </SidebarWrapper>
);
