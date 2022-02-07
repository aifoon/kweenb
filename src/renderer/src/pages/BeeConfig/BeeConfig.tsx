import { Grid } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { CardVerticalStack } from "@components/Cards";
import { PageHeader } from "@components/PageHeader";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Z3Page } from "@renderer/src/layout";
import { Button } from "@renderer/src/components";
import { Utils } from "../../lib/utils";
import { BeeConfigActions } from "./BeeConfigActions";
import { BeeConfigConfig } from "./BeeConfigConfig";
import { BeeConfigLogging } from "./BeeConfigLogging";

export const BeeConfig = () => {
  const { id } = useParams();
  return (
    <Z3Page
      pageHeader={
        <PageHeader
          title={`${Utils.addLeadingZero(id)}`}
          statusBullet={<StatusBullet type={StatusBulletType.NotActive} />}
        />
      }
    >
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <CardVerticalStack>
            <BeeConfigActions />
            <BeeConfigConfig />
          </CardVerticalStack>
        </Grid>
        <Grid item xs={12} md={6}>
          <BeeConfigLogging />
        </Grid>
      </Grid>
    </Z3Page>
  );
};
