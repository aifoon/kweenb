import { Grid } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { CardVerticalStack } from "@components/Cards";
import { PageHeader } from "@components/PageHeader";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Z3Page } from "@renderer/src/layout";
import { useBeeStatus, useBeeConfig } from "@renderer/src/hooks";
import { Loader } from "@components/.";
import { Utils } from "../../lib/utils";
import { BeeConfigActions } from "./BeeConfigActions";
import { BeeConfigConfig } from "./BeeConfigConfig";
import { BeeConfigLogging } from "./BeeConfigLogging";

export const BeeConfig = () => {
  const { id } = useParams();
  const numberizedId = Number(id) || 0;
  const { isOnline, isJackRunning, isJacktripRunning } =
    useBeeStatus(numberizedId);
  const { loading, beeConfig, updateBeeConfig } = useBeeConfig(numberizedId);

  if (loading) return <Loader />;

  return (
    <Z3Page
      pageHeader={
        <PageHeader
          title={`${Utils.addLeadingZero(id)}`}
          statusBullet={
            <StatusBullet
              type={
                isOnline ? StatusBulletType.Active : StatusBulletType.NotActive
              }
            />
          }
        />
      }
    >
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <CardVerticalStack>
            <BeeConfigActions
              isJackRunning={isJackRunning}
              isJacktripRunning={isJacktripRunning}
            />
            <BeeConfigConfig
              updateBeeConfig={updateBeeConfig}
              beeConfig={beeConfig}
            />
          </CardVerticalStack>
        </Grid>
        <Grid item xs={12} md={6}>
          <BeeConfigLogging />
        </Grid>
      </Grid>
    </Z3Page>
  );
};
