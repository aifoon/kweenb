import React, { useState } from "react";
import { Button, ButtonSize, ButtonUse, ButtonType } from "@components/Button";
import { PageHeader } from "@components/PageHeader";
import { BeeCard } from "@components/Cards";
import { Grid } from "@mui/material";
import { BaseModal } from "./Modals/BaseModal";

export const ManageBees = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <>
      <BaseModal title="Add Bee" open={open} onClose={handleClose}>
        <div>Dit is een test</div>
      </BaseModal>

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

      <Grid container spacing={5}>
        <Grid item xl={2} lg={3} xs={12} sm={6} md={4}>
          <BeeCard
            onBeeConfigClick={() => console.log("Clicked Bee Config")}
            number={4}
          />
        </Grid>
      </Grid>
    </>
  );
};
