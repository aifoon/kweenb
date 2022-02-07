import React, { useState } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { PageHeader } from "@components/PageHeader";
import { BeeCard } from "@components/Cards";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { BaseModal } from "./Modals/BaseModal";
import { Z3Page } from "../layout";

export const ManageBees = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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
      <BaseModal title="Add Bee" open={open} onClose={handleClose}>
        <div>Dit is een test</div>
      </BaseModal>

      <Grid container spacing={5}>
        <Grid item xl={2} lg={3} xs={12} sm={6} md={4}>
          <BeeCard
            onBeeConfigClick={() => navigate(`manage-bees/${4}`)}
            number={4}
          />
        </Grid>
      </Grid>
    </Z3Page>
  );
};
