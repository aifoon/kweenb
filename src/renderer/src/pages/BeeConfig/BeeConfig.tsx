import { Grid } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { CardVerticalStack } from "@components/Cards";
import { PageHeader } from "@components/PageHeader";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Z3Page } from "@renderer/src/layout";
import { useBee, useBeeConfig } from "@renderer/src/hooks";
import { Loader } from "@components/Loader";
import { Utils } from "@shared/utils";
import { BeeConfigActions } from "./BeeConfigActions";
import { BeeConfigConfig } from "./BeeConfigConfig";
import { BeeConfigSettings } from "./BeeConfigSettings";

export const BeeConfig = () => {
  const { id } = useParams();
  const numberizedId = Number(id) || 0;
  const {
    bee,
    reconnect,
    killJack,
    killJacktrip,
    killJackAndJacktrip,
    loading,
    saveConfig,
    startJack,
    updateBeeSetting,
  } = useBee(numberizedId);
  const { beeConfig } = useBeeConfig(numberizedId);

  if (loading) return <Loader />;

  return (
    <Z3Page
      pageHeader={
        <PageHeader
          title={`${Utils.addLeadingZero(id)}`}
          statusBullet={
            <StatusBullet
              type={
                bee.isOnline
                  ? StatusBulletType.Active
                  : StatusBulletType.NotActive
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
              isJackRunning={bee.status.isJackRunning}
              isJacktripRunning={bee.status.isJacktripRunning}
              onStartJack={startJack}
              onStopJack={killJack}
              onStopJacktrip={killJacktrip}
              onKillJackAndJacktrip={killJackAndJacktrip}
              onReconnect={reconnect}
            />
            <BeeConfigSettings
              onUpdate={updateBeeSetting}
              ipAddress={bee.ipAddress}
              name={bee.name}
            />
            <BeeConfigConfig onUpdate={saveConfig} beeConfig={beeConfig} />
          </CardVerticalStack>
        </Grid>
      </Grid>
    </Z3Page>
  );
};
