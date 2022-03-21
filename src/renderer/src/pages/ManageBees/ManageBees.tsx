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
import { useBees } from "@renderer/src/hooks/useBees";
import { useAppContext } from "@renderer/src/hooks/useAppContext";
import { useShowState } from "@renderer/src/hooks/useShowState";
import { Z3Page } from "../../layout";
import { Bee } from "./Bee";
import { AddBeeModal } from "./AddBeeModal";

export const ManageBees = () => {
  const { open, handleOpen, handleClose } = useShowState(false);
  const { loading, bees } = useBees();
  const { appContext } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    appContext.setLoading(loading);
  }, [loading]);

  return (
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
      <AddBeeModal open={open} onClose={handleClose} />
      <Grid container spacing={5}>
        {bees.map(({ id, ipAddress, isOnline, name }) => (
          <Grid key={id} item xl={2} lg={3} xs={12} sm={6} md={4}>
            <Bee
              onBeeConfigClick={() => navigate(`manage-bees/${id}`)}
              number={id}
              ipAddress={ipAddress}
              name={name}
              online={isOnline}
            />
          </Grid>
        ))}
      </Grid>
    </Z3Page>
  );
};
