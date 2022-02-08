import React, { useState } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { PageHeader } from "@components/PageHeader";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Z3Page } from "../../layout";
import { Bee } from "./Bee";
import { AddBeeModal } from "./AddBeeModal";

const demoBees = [1, 2, 3, 4, 5, 6, 7, 8];

export const ManageBees = () => {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
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
      <AddBeeModal open={openModal} onClose={handleClose} />
      <Grid container spacing={5}>
        {demoBees.map((bee) => (
          <Grid key={bee} item xl={2} lg={3} xs={12} sm={6} md={4}>
            <Bee
              onBeeConfigClick={() => navigate(`manage-bees/${bee}`)}
              number={bee}
            />
          </Grid>
        ))}
      </Grid>
    </Z3Page>
  );
};
