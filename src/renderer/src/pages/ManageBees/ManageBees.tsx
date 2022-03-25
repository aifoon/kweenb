import React, { useEffect } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { PageHeader } from "@components/PageHeader";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBees } from "@renderer/src/hooks";
import { useShowState } from "@renderer/src/hooks/useShowState";
import { BeeCard } from "@components/Cards";
import { Loader } from "@components/Loader";
import { IBeeInput } from "@shared/interfaces";
import { Z3Page } from "../../layout";
import { AddBeeModal } from "./AddBeeModal";
import { NoBees } from "./NoBees";

export const ManageBees = () => {
  const { open, handleOpen, handleClose } = useShowState(false);
  const { loading, bees, deleteBee, createBee } = useBees();
  const navigate = useNavigate();

  if (loading) return <Loader />;

  const onBeeSubmitted = async (beeInput: IBeeInput) => {
    await createBee(beeInput);
    handleClose();
  };

  return (
    <>
      <AddBeeModal
        open={open}
        onClose={handleClose}
        onBeeSubmitted={onBeeSubmitted}
      />
      {bees.length === 0 && <NoBees onAddBeeClicked={handleOpen} />}
      {bees.length > 0 && (
        <Z3Page
          pageHeader={
            <PageHeader
              title="Manage Bees"
              buttons={[
                <Button
                  key="addNewBee"
                  buttonSize={ButtonSize.Medium}
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
            {bees.map(({ id, ipAddress, isOnline, name, status }) => (
              <Grid key={id} item xl={2} lg={3} xs={12} sm={6} md={4}>
                <BeeCard
                  number={id}
                  onBeeConfigClick={() => navigate(`manage-bees/${id}`)}
                  onBeeDeleteClick={() => {
                    deleteBee(id);
                  }}
                  onBeeExitClick={() => console.log("exit")}
                  name={name}
                  ipAddress={ipAddress}
                  online={isOnline}
                  jackIsRunning={status?.isJackRunning}
                  jackTripIsRunning={status?.isJacktripRunning}
                />
              </Grid>
            ))}
          </Grid>
        </Z3Page>
      )}
    </>
  );
};
