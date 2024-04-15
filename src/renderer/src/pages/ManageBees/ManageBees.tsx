import React from "react";
import { ButtonSize, ButtonUse, ButtonType } from "@components/Buttons/Button";
import { PageHeader } from "@components/PageHeader";
import {
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Button,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import DnsIcon from "@mui/icons-material/Dns";
import { useNavigate } from "react-router-dom";
import { useBees, useShowState, useConfirmation } from "@renderer/src/hooks";
import { BeeCardDropzone } from "@components/Cards";
import { Loader } from "@components/Loader";
import { ChannelType, IBeeInput } from "@shared/interfaces";
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
import { useAppStore } from "@renderer/src/hooks/useAppStore";

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
  const manageBeesCollapsed = useAppStore((state) => state.manageBeesCollapsed);
  const setManageBeesCollapsed = useAppStore(
    (state) => state.setManageBeesCollapsed
  );

  if (loading) return <Loader />;

  /**
   * When a bee is submitted, create the bee and close the modal
   * @param beeInput
   */
  const onBeeSubmitted = async (beeInput: IBeeInput) => {
    await createBee(beeInput);
    handleClose();
  };

  /**
   * When an inactive bee is dropped, set the bee to active
   * @param number
   */
  const onInActiveBeeDropped = async (number: number) => {
    await setBeeActive(number, true);
  };

  /**
   * When a bee card is dropped, set the bee to inactive
   * @param number
   */
  const onBeeCardDropped = async (number: number) => {
    await setBeeActive(number, false);
  };

  /**
   * Move bees to active or inactive
   * @param active
   */
  const moveBees = async (active: number[]) => {
    const filteredActive = active.filter((id) => {
      return (
        inActiveBees.some((bee) => bee.id === id) ||
        activeBees.some((bee) => bee.id === id)
      );
    });
    const deactivatePromises = activeBees
      .filter((bee) => !active.includes(bee.id))
      .map((bee) => setBeeActive(bee.id, false));

    const activatePromises = filteredActive
      .filter((id) => !activeBees.map((bee) => bee.id).includes(id))
      .map((id) => setBeeActive(id, true));

    await Promise.all([...deactivatePromises, ...activatePromises]);
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
              buttons={
                <>
                  <ToggleButtonGroup
                    style={{ fontSize: "1rem" }}
                    size="small"
                    aria-label="Small sizes"
                  >
                    <ToggleButton
                      selected={manageBeesCollapsed}
                      value="collapsed"
                      aria-label="left aligned"
                      onClick={() =>
                        setManageBeesCollapsed(!manageBeesCollapsed)
                      }
                    >
                      <ViewListIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                      selected={!manageBeesCollapsed}
                      value="full"
                      aria-label="left aligned"
                      onClick={() =>
                        setManageBeesCollapsed(!manageBeesCollapsed)
                      }
                    >
                      <DnsIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ButtonGroup aria-label="Action Button Group">
                    <Button
                      key="beesClear"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => moveBees([])}
                    >
                      Clear
                    </Button>
                    <Button
                      key="bees14"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => moveBees([1, 2, 3, 4])}
                    >
                      1-4
                    </Button>
                    <Button
                      key="bees18"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => moveBees([1, 2, 3, 4, 5, 6, 7, 8])}
                    >
                      1-8
                    </Button>
                    <Button
                      key="bees112"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        moveBees([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
                      }
                    >
                      1-12
                    </Button>
                    <Button
                      key="bees116"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        moveBees([
                          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        ])
                      }
                    >
                      1-16
                    </Button>
                    <Button
                      key="beesAll"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        moveBees([
                          ...activeBees.map((bee) => bee.id),
                          ...inActiveBees.map((bee) => bee.id),
                        ])
                      }
                    >
                      All
                    </Button>
                  </ButtonGroup>
                  <ButtonGroup aria-label="Action Button Group">
                    <Button
                      key="addNewBee"
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleOpen}
                    >
                      Add New Bee
                    </Button>
                  </ButtonGroup>
                </>
              }
            />
          }
        >
          <Grid container spacing={5}>
            <Grid item sm={12} md={8} lg={9}>
              <Grid container spacing={3}>
                {activeBees.map(
                  ({ id, ipAddress, isOnline, isApiOn, name, status }) => (
                    <Grid key={id} item lg={4} xl={3} xs={12} sm={12} md={4}>
                      <BeeCardWithPolling
                        key={id}
                        number={id}
                        onBeeConfigClick={() => navigate(`swarm/${id}`)}
                        onBeeDeleteClick={() => handleOpenConfirmModal({ id })}
                        name={name}
                        ipAddress={ipAddress}
                        apiOn={isApiOn}
                        online={isOnline}
                        channelType={ChannelType.MONO}
                        channel1={id}
                        channel2={id}
                        jackIsRunning={status?.isJackRunning}
                        jackTripIsRunning={status?.isJacktripRunning}
                        collapsed={manageBeesCollapsed}
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
                  md={4}
                >
                  <BeeCardDropzone
                    collapsed={manageBeesCollapsed}
                    onInActiveBeeDropped={onInActiveBeeDropped}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item sm={12} md={4} lg={3}>
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
