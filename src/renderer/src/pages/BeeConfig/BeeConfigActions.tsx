import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import React from "react";
import { Grid } from "@mui/material";
import { BeeConfigActionsRunJack } from "./BeeConfigActionsRunJack";
import { BeeConfigActionsRunJacktrip } from "./BeeConfigActionsRunJacktrip";

export const BeeConfigActions = () => (
  <Card title="Actions">
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <BeeConfigActionsRunJack isRunning />
      </Grid>
      <Grid item xs={12} md={6}>
        <BeeConfigActionsRunJacktrip />
      </Grid>
      <Grid item xs={12}>
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Danger}
          onClick={() => {
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
