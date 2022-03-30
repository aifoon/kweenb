import React from "react";

import { StatusBulletType } from "@components/StatusBullet";
import {
  Sidebar,
  SidebarStatusBadge,
  SidebarButton,
} from "@components/Sidebar";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import SettingsIcon from "@mui/icons-material/Settings";
import RouteIcon from "@mui/icons-material/Route";
import HandymanIcon from "@mui/icons-material/Handyman";
import { useNavigate, useLocation } from "react-router-dom";
import wcmatch from "wildcard-match";

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
    key: "beeSettings",
    title: "Bee Settings",
    pathNames: ["/bee-settings"],
    icon: <SettingsIcon />,
  },
  {
    key: "audioRoutes",
    title: "Audio Routes",
    pathNames: ["/audio-routes"],
    icon: <RouteIcon />,
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
  return (
    <Sidebar
      fixedToSide
      width="var(--sidebarWidth)"
      height="var(--contentHeight)"
      badges={[
        <SidebarStatusBadge
          key="theKween"
          text="The Kween"
          status={StatusBulletType.Active}
        />,
      ]}
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
