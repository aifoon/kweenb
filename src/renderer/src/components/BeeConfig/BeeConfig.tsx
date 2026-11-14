import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { PageHeader } from "@components/PageHeader";
import { StatusBullet, StatusBulletType } from "@components/StatusBullet";
import { Z3Page } from "@components/Layout";
import { useBee, useShowState } from "@renderer/src/hooks";
import { BeeDeviceManagerActions } from "@shared/enums";
import { Utils } from "@shared/utils";
import { BeeConfigActions } from "./BeeConfigActions";
import { BeeConfigSettings } from "./BeeConfigSettings";
import { SaveSoundsModal } from "../Modals/SaveSoundsModal";
import { RestoreSoundsModal } from "../Modals/RestoreSoundsModal";

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
  const {
    open: openSaveSoundsModal,
    handleOpen: handleOpenSaveSoundsModal,
    handleClose: handleCloseSaveSoundsModal,
  } = useShowState(false);
  const {
    open: openRestoreSoundsModal,
    handleOpen: handleOpenRestoreSoundsModal,
    handleClose: handleCloseRestoreSoundsModal,
  } = useShowState(false);
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
      <SaveSoundsModal
        open={openSaveSoundsModal}
        onClose={handleCloseSaveSoundsModal}
        beeId={numberizedId}
      />
      <RestoreSoundsModal
        open={openRestoreSoundsModal}
        onClose={handleCloseRestoreSoundsModal}
        beeId={numberizedId}
        beeName={bee.name}
      />
      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <BeeConfigActions
            onKillJackAndJacktrip={killJackAndJacktrip}
            onReconnect={reconnect}
            onReboot={() => manageDevice(BeeDeviceManagerActions.REBOOT)}
            onShutdown={() => manageDevice(BeeDeviceManagerActions.SHUTDOWN)}
            onSaveSounds={handleOpenSaveSoundsModal}
            onRestoreSounds={handleOpenRestoreSoundsModal}
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
