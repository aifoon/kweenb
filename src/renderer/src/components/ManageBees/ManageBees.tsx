import React, { useEffect } from "react";
import { PageHeader } from "@components/PageHeader";
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import DnsIcon from "@mui/icons-material/Dns";
import { useNavigate } from "react-router-dom";
import { useConfirmation, useBeeStore } from "@renderer/src/hooks";
import { BeeCardDropzone } from "@components/Cards";
import { Loader } from "@components/Loader";
import { ChannelType } from "@shared/enums";
import { ConfirmModal } from "@components/Modals/ConfirmModal";
import {
  InActiveBee,
  InActiveBees,
  InActiveBeeDropzone,
} from "@components/InActiveBees";
import { Z3Page } from "@components/Layout";
import { NoBees } from "./NoBees";
import { BeeCardWithPolling } from "./BeeCardWithPolling";
import { useAppStore } from "@renderer/src/hooks/useAppStore";
import {
  followLiveLevels,
  useLiveMetersSwitch,
} from "@renderer/src/hooks/useLiveLevels";

/**
 * How many bees to use, from 1 up to this number
 */
const BEE_SELECTIONS = [4, 8, 12, 16];

export const ManageBees = () => {
  const navigate = useNavigate();

  // Control the confirmation modal
  // these two dialogs live at app level, so the File menu can open them too
  const setOpenNewSpeakerModal = useAppStore(
    (state) => state.setOpenNewSpeakerModal
  );
  const setOpenAddBeeModal = useAppStore((state) => state.setOpenAddBeeModal);
  const handleOpenNewSpeakerModal = () => setOpenNewSpeakerModal(true);
  const {
    open: openConfirmModal,
    confirmationData,
    handleOpen: handleOpenConfirmModal,
    handleClose: handleCloseConfirmModal,
  } = useConfirmation<{ id: number }>(false, { id: 0 });

  // The bees store is used to get the bees and manage them
  const initializing = useBeeStore((state) => state.initializing);
  const activeBees = useBeeStore((state) => state.activeBees);
  const deleteBee = useBeeStore((state) => state.deleteBee);
  const inActiveBees = useBeeStore((state) => state.inActiveBees);
  const setActive = useBeeStore((state) => state.setActive);
  const setInActive = useBeeStore((state) => state.setInActive);

  // Control the appearance of the manage bees section
  const manageBeesCollapsed = useAppStore((state) => state.manageBeesCollapsed);

  // live meters: every bee in use tells its level as long as the switch is
  // on and this page is open
  const liveMeters = useLiveMetersSwitch((state) => state.on);
  const setLiveMeters = useLiveMetersSwitch((state) => state.set);
  const activeBeeIds = activeBees.map((bee) => bee.id).join(",");
  useEffect(() => {
    if (!liveMeters) return undefined;
    followLiveLevels(
      "swarm",
      activeBeeIds === "" ? [] : activeBeeIds.split(",").map(Number)
    );
    return () => followLiveLevels("swarm", []);
  }, [liveMeters, activeBeeIds]);
  const setManageBeesCollapsed = useAppStore(
    (state) => state.setManageBeesCollapsed
  );

  // When the bees are initializing, show a loader
  if (initializing) return <Loader />;

  /**
   * When an inactive bee is dropped, set the bee to active
   * @param number
   */
  const onInActiveBeeDropped = async (number: number) => {
    await setActive(number);
  };

  /**
   * When a bee card is dropped, set the bee to inactive
   * @param number
   */
  const onBeeCardDropped = async (number: number) => {
    await setInActive(number);
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
      .map((bee) => setInActive(bee.id));

    const activatePromises = filteredActive
      .filter((id) => !activeBees.map((bee) => bee.id).includes(id))
      .map((id) => setActive(id));

    await Promise.all([...deactivatePromises, ...activatePromises]);
  };

  return (
    <>
      <ConfirmModal
        message="Know what you're doing, you're about to kill a bee. Are you sure?"
        open={openConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={() => {
          deleteBee(confirmationData.id);
        }}
      />
      {activeBees.length === 0 && inActiveBees.length === 0 && (
        <NoBees
          onAddBeeClicked={() => setOpenAddBeeModal(true)}
          onNewSpeakerClicked={handleOpenNewSpeakerModal}
        />
      )}
      {(activeBees.length > 0 || inActiveBees.length > 0) && (
        <Z3Page pageHeader={<PageHeader title="Swarm" />}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="small" style={{ marginRight: 4 }}>
                Use bees
              </Typography>
              {BEE_SELECTIONS.map((count) => (
                <Button
                  key={`bees1to${count}`}
                  size="small"
                  variant="contained"
                  color="secondary"
                  style={{ whiteSpace: "nowrap", minWidth: 0 }}
                  onClick={() =>
                    moveBees(Array.from({ length: count }, (_, i) => i + 1))
                  }
                >
                  {`1–${count}`}
                </Button>
              ))}
              <Button
                key="beesAll"
                size="small"
                variant="contained"
                color="secondary"
                style={{ minWidth: 0 }}
                onClick={() =>
                  moveBees([
                    ...activeBees.map((bee) => bee.id),
                    ...inActiveBees.map((bee) => bee.id),
                  ])
                }
              >
                All
              </Button>
              <Button
                key="beesClear"
                size="small"
                variant="text"
                color="secondary"
                style={{ minWidth: 0 }}
                onClick={() => moveBees([])}
              >
                None
              </Button>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Tooltip title="Every bee tells how loud it plays, ten times a second. Meant for a check before the show: switch it off afterwards, it takes room on the Wi-Fi.">
                <Box
                  display="flex"
                  alignItems="center"
                  style={{ cursor: "pointer" }}
                  onClick={() => setLiveMeters(!liveMeters)}
                >
                  <Switch size="small" checked={liveMeters} />
                  <Typography variant="small">Live meters</Typography>
                </Box>
              </Tooltip>
              <ToggleButtonGroup
                size="small"
                aria-label="How the bees are shown"
              >
                <ToggleButton
                  selected={manageBeesCollapsed}
                  value="collapsed"
                  aria-label="Compact"
                  onClick={() => setManageBeesCollapsed(true)}
                >
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton
                  selected={!manageBeesCollapsed}
                  value="full"
                  aria-label="Detailed"
                  onClick={() => setManageBeesCollapsed(false)}
                >
                  <DnsIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          <Grid container spacing={5}>
            <Grid item sm={12} md={8} lg={9}>
              <Box
                display="grid"
                gap={2}
                gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
              >
                {activeBees.map(
                  ({ id, ipAddress, isOnline, isApiOn, name, status }) => (
                    <Box key={id} minWidth={0}>
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
                        onDoubleClick={() => setInActive(id)}
                      />
                    </Box>
                  )
                )}
                <Box key="beeCardDropzone" minWidth={0}>
                  <BeeCardDropzone
                    collapsed={manageBeesCollapsed}
                    onInActiveBeeDropped={onInActiveBeeDropped}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item sm={12} md={4} lg={3}>
              <InActiveBees>
                <InActiveBeeDropzone onBeeCardDropped={onBeeCardDropped} />
                {inActiveBees.length > 0 &&
                  inActiveBees.map(({ id, name }) => (
                    <InActiveBee
                      onDoubleClick={() => setActive(id)}
                      key={id}
                      number={id}
                      name={name}
                    />
                  ))}
              </InActiveBees>
            </Grid>
          </Grid>
        </Z3Page>
      )}
    </>
  );
};
