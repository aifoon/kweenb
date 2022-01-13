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

/**
 * List of Sidebar Buttons
 */

const sidebarButtons = [
  {
    key: "manageBees",
    title: "Manage Bees",
    pathNames: ["/", "/manage-bees"],
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
          active={pathNames.includes(location.pathname)}
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
