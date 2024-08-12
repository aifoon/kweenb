import React from "react";

import { Navigation, NavigationButtons } from "@components/Navigation";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";

export const Z3Navigation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
    <Navigation title="kweenb " fixedToTop height="var(--navigationHeight)">
      <NavigationButtons buttons={buttons} />
    </Navigation>
  );
};
