import React, { useState } from "react";

import { Navigation, NavigationButtons } from "@components/Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { SetSocketUrl } from "../Modals/SetSocketUrl";

export const Z3Navigation = () => {
  /**
   * Router hooks
   */

  const navigate = useNavigate();
  const { pathname } = useLocation();

  /**
   * Inner states
   */

  const [openSetSocketUrl, setOpenSetSocketUrl] = useState(false);

  const buttons = [
    <Button
      size="small"
      variant={pathname === "/" ? "contained" : "outlined"}
      color={pathname === "/" ? "primary" : "secondary"}
      key="singleBees"
      onClick={() => navigate("/")}
    >
      single bees
    </Button>,
    <Button
      key="sceneTrigger"
      size="small"
      variant={pathname === "/scene-trigger" ? "contained" : "outlined"}
      color={pathname === "/scene-trigger" ? "primary" : "secondary"}
      onClick={() => navigate("/scene-trigger")}
    >
      scene trigger
    </Button>,
  ];

  return (
    <>
      <SetSocketUrl
        open={openSetSocketUrl}
        onClose={() => setOpenSetSocketUrl(false)}
      />
      <Navigation
        onLogoClick={() => setOpenSetSocketUrl(true)}
        title="kweenb"
        fixedToTop
        height="var(--navigationHeight)"
      >
        <NavigationButtons buttons={buttons} />
      </Navigation>
    </>
  );
};
