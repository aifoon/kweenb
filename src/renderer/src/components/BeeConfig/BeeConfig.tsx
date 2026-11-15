import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { PageHeader } from "@components/PageHeader";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Z3Page } from "@components/Layout";
import { useBee } from "@renderer/src/hooks";
import { BeeDeviceManagerActions } from "@shared/enums";
import { Utils } from "@shared/utils";
import { BeeConfigActions } from "./BeeConfigActions";
import { BeeConfigSettings } from "./BeeConfigSettings";

export const BeeConfig = () => {
  const { id } = useParams();
  const numberizedId = Number(id) || 0;
  const {
    bee,
    reconnect,
    killJackAndJacktrip,
    manageDevice,
    updateBeeSetting,
  } = useBee(numberizedId);
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
          <BeeConfigActions
            onKillJackAndJacktrip={killJackAndJacktrip}
            onReconnect={reconnect}
            onReboot={() => manageDevice(BeeDeviceManagerActions.REBOOT)}
            onShutdown={() => manageDevice(BeeDeviceManagerActions.SHUTDOWN)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BeeConfigSettings
            onUpdate={updateBeeSetting}
            ipAddress={bee.ipAddress}
            name={bee.name}
          />
        </Grid>
      </Grid>
    </Z3Page>
  );
};
