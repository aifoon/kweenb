import React from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { PageHeader } from "@components/PageHeader";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBees, useShowState, useConfirmation } from "@renderer/src/hooks";
import { BeeCardDropzone } from "@components/Cards";
import { Loader } from "@components/Loader";
import { IBeeInput } from "@shared/interfaces";
import { ConfirmModal } from "@components/Modals/ConfirmModal";
import {
  InActiveBee,
  InActiveBees,
  InActiveBeeDropzone,
} from "@components/InActiveBees";
import { Z3Page } from "../../layout";
import { AddBeeModal } from "./AddBeeModal";
import { NoBees } from "./NoBees";
import { BeeCardWithPolling } from "./BeeCardWithPolling";

export const ManageBees = () => {
  const { open, handleOpen, handleClose } = useShowState(false);
  const {
    open: openConfirmModal,
    confirmationData,
    handleOpen: handleOpenConfirmModal,
    handleClose: handleCloseConfirmModal,
  } = useConfirmation<{ id: number }>(false, { id: 0 });
  const {
    loading,
    activeBees,
    inActiveBees,
    deleteBee,
    createBee,
    setBeeActive,
  } = useBees();
  const navigate = useNavigate();

  if (loading) return <Loader />;

  const onBeeSubmitted = async (beeInput: IBeeInput) => {
    await createBee(beeInput);
    handleClose();
  };

  const onInActiveBeeDropped = async (number: number) => {
    await setBeeActive(number, true);
  };

  const onBeeCardDropped = async (number: number) => {
    await setBeeActive(number, false);
  };

  return (
    <>
      <AddBeeModal
        open={open}
        onClose={handleClose}
        onBeeSubmitted={onBeeSubmitted}
      />
      <ConfirmModal
        message="Know what you're doing, you're about to kill a bee. Are you sure?"
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={() => {
          deleteBee(confirmationData.id);
        }}
      />
      {activeBees.length === 0 && inActiveBees.length === 0 && (
        <NoBees onAddBeeClicked={handleOpen} />
      )}
      {(activeBees.length > 0 || inActiveBees.length > 0) && (
        <Z3Page
          pageHeader={
            <PageHeader
              title="Swarm"
              buttons={[
                <Button
                  key="addNewBee"
                  buttonSize={ButtonSize.Small}
                  buttonUse={ButtonUse.Normal}
                  buttonType={ButtonType.Primary}
                  onClick={handleOpen}
                >
                  Add New Bee
                </Button>,
              ]}
            />
          }
        >
          <Grid container spacing={5}>
            <Grid item sm={12} md={7} lg={9}>
              <Grid container spacing={5}>
                {activeBees.map(
                  ({ id, ipAddress, isOnline, isApiOn, name, status }) => (
                    <Grid key={id} item lg={4} xl={3} xs={12} sm={12} md={6}>
                      <BeeCardWithPolling
                        key={id}
                        number={id}
                        onBeeConfigClick={() => navigate(`swarm/${id}`)}
                        onBeeDeleteClick={() => handleOpenConfirmModal({ id })}
                        name={name}
                        ipAddress={ipAddress}
                        apiOn={isApiOn}
                        online={isOnline}
                        jackIsRunning={status?.isJackRunning}
                        jackTripIsRunning={status?.isJacktripRunning}
                      />
                    </Grid>
                  )
                )}
                <Grid
                  key="beeCardDropzone"
                  item
                  lg={4}
                  xl={3}
                  xs={12}
                  sm={12}
                  md={6}
                >
                  <BeeCardDropzone
                    onInActiveBeeDropped={onInActiveBeeDropped}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item sm={12} md={5} lg={3}>
              <InActiveBees>
                <InActiveBeeDropzone onBeeCardDropped={onBeeCardDropped} />
                {inActiveBees.length > 0 &&
                  inActiveBees.map(({ id, name }) => (
                    <InActiveBee key={id} number={id} name={name} />
                  ))}
              </InActiveBees>
            </Grid>
          </Grid>
        </Z3Page>
      )}
    </>
  );
};
