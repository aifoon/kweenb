import React from "react";
import { StatusBulletType } from "@components/StatusBullet";
import {
  Sidebar,
  SidebarStatusBadge,
  SidebarButton,
} from "@components/Sidebar";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import SettingsIcon from "@mui/icons-material/Settings";
import HandymanIcon from "@mui/icons-material/Handyman";
import SpeakerIcon from "@mui/icons-material/Speaker";
import NearMeIcon from "@mui/icons-material/NearMe";
import { useNavigate, useLocation } from "react-router-dom";
import wcmatch from "wildcard-match";
import { useAppStore } from "@renderer/src/hooks";
import { app } from "electron";

/**
 * List of Sidebar Buttons
 */
const sidebarButtons = [
  {
    key: "swarm",
    title: "Swarm",
    pathNames: ["/", "/swarm/*"],
    icon: <EmojiNatureIcon />,
  },
  {
    key: "audio",
    title: "Audio",
    pathNames: ["/audio"],
    icon: <SpeakerIcon />,
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
  const appViews = useAppStore((state) => state.appViews);

  return (
    <Sidebar
      fixedToSide
      width="var(--sidebarWidth)"
      height="var(--contentHeight)"
      buttons={sidebarButtons.map(({ icon, title, pathNames, key }) => {
        // Define what we need to show in the sidebar
        if (!appViews.map((view) => view.toLowerCase()).includes(key)) {
          return <></>;
        }

        // Return the button in the sidebar whenever we need to show it
        return (
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
        );
      })}
    />
  );
};
