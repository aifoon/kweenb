import React, { useEffect } from "react";

import { StatusBulletType } from "@components/StatusBullet";
import {
  Sidebar,
  SidebarStatusBadge,
  SidebarButton,
} from "@components/Sidebar";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import SettingsIcon from "@mui/icons-material/Settings";
import HandymanIcon from "@mui/icons-material/Handyman";
import NearMeIcon from "@mui/icons-material/NearMe";
import { useNavigate, useLocation } from "react-router-dom";
import wcmatch from "wildcard-match";
import { AppMode } from "@shared/enums";
import { useTheKween } from "../hooks/useTheKween";
import { useAppContext } from "../hooks";

/**
 * List of Sidebar Buttons
 */
const sidebarButtons = [
  {
    key: "manageSwarm",
    title: "Swarm",
    pathNames: ["/", "/swarm/*"],
    icon: <EmojiNatureIcon />,
  },
  {
    key: "positioning",
    title: "Positioning",
    pathNames: ["/positioning"],
    icon: <NearMeIcon />,
  },
  {
    key: "settings",
    title: "Settings",
    pathNames: ["/settings"],
    icon: <SettingsIcon />,
  },
  {
    key: "tools",
    title: "Tools",
    pathNames: ["/tools"],
    icon: <HandymanIcon />,
  },
];

/**
 * Check if a navigatedpath is active, based on pathnames.
 * The values in the pathnames can use a wildcard (*).
 *
 * @param navigatedPath The path we just navigated to
 * @param pathNames The pathnames to check
 * @returns True of Falsy
 */
const isActive = (navigatedPath: string, pathNames: string[]): boolean =>
  pathNames
    .map((p) => {
      const isMatch = wcmatch(p);
      return navigatedPath === p || isMatch(navigatedPath);
    })
    .includes(true);

export const Z3Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { thekween } = useTheKween();
  const { appContext } = useAppContext();

  const badges =
    appContext.appMode === AppMode.Hub
      ? [
          <SidebarStatusBadge
            key="theKween"
            text="The Kween"
            status={
              thekween?.isOnline && thekween?.isApiOn
                ? StatusBulletType.Active
                : StatusBulletType.NotActive
            }
          />,
        ]
      : [];

  return (
    <Sidebar
      fixedToSide
      width="var(--sidebarWidth)"
      height="var(--contentHeight)"
      badges={badges}
      buttons={sidebarButtons.map(({ icon, title, pathNames, key }) => (
        <SidebarButton
          icon={icon}
          text={title}
          key={key}
          active={isActive(location.pathname, pathNames)}
          onClick={() => {
            if (location.pathname !== pathNames[0]) {
              navigate(pathNames[0]);
            }
          }}
        />
      ))}
    />
  );
};
