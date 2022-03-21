import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { BeeConfigActionsRunJack } from "./BeeConfigActionsRunJack";
import { BeeConfigActionsRunJacktrip } from "./BeeConfigActionsRunJacktrip";

interface BeeConfigActionsProps {
  isJackRunning?: boolean;
  isJacktripRunning?: boolean;
}

export const BeeConfigActions = ({
  isJackRunning = false,
  isJacktripRunning = false,
}: BeeConfigActionsProps) => {
  const [currentIsJackRunning, setCurrentIsJackRunning] =
    useState(isJackRunning);
  const [currentIsJacktripRunning, setCurrentIsJacktripRunning] =
    useState(isJacktripRunning);

  useEffect(() => setCurrentIsJackRunning(isJackRunning), [isJackRunning]);
  useEffect(
    () => setCurrentIsJacktripRunning(isJacktripRunning),
    [isJacktripRunning]
  );

  return (
    <Card title="Actions">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <BeeConfigActionsRunJack isRunning={currentIsJackRunning} />
        </Grid>
        <Grid item xs={12} md={6}>
          <BeeConfigActionsRunJacktrip isRunning={currentIsJacktripRunning} />
        </Grid>
        <Grid item xs={12}>
          <Button
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
            buttonUse={ButtonUse.Danger}
            onClick={async () => {
              console.log("Clicking on Kill All");
            }}
            style={{ width: "100%", height: "100%" }}
          >
            Kill all
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};
