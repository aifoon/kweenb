import { BaseModal } from "@components/Modals/BaseModal";
import { useCallback, useEffect, useState } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import {
  IUpdateDevice,
  IUpdateProgress,
  IUpdatesState,
} from "@shared/interfaces";
import { useAppStore } from "@renderer/src/hooks";
import styled from "styled-components";

type CheckForUpdatesModalProps = {
  open: boolean;
  onClose: () => void;
};

const Table = styled.div`
  display: grid;
  grid-template-columns: minmax(110px, 1.2fr) 100px 90px minmax(200px, 2fr);
  column-gap: 16px;
  row-gap: 10px;
  align-items: center;
  max-height: 320px;
  overflow-y: auto;
`;

const Head = styled(Typography)`
  color: var(--grey-400);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--grey-300);
`;

// what a device is doing while it is updated, or how that ended
type Run = { step: IUpdateProgress["step"]; message?: string };

const canUpdate = (device: IUpdateDevice) =>
  (device.state === "update" || device.state === "restart") &&
  !device.batteryLow;

/**
 * What the start of KweenB tells in the bar at the top, when there is
 * something to update
 */
export const noticeOf = (state: IUpdatesState): string | null => {
  const waiting = state.devices.filter((d) => d.state === "update").length;
  if (state.kweenb.available) return `KweenB ${state.kweenb.latest} is available`;
  if (waiting > 0)
    return waiting === 1
      ? "New firmware for 1 device"
      : `New firmware for ${waiting} devices`;
  return null;
};

/**
 * File → Check for Updates…: is this the newest KweenB, and which bees and
 * satellites on the network can get new firmware
 */
export const CheckForUpdatesModal = ({
  open,
  onClose,
}: CheckForUpdatesModalProps) => {
  const [state, setState] = useState<IUpdatesState | null>(null);
  const [runs, setRuns] = useState<Record<string, Run>>({});
  const [download, setDownload] = useState<Run & { percentage?: number }>();
  // the devices an update was asked for while sound is streaming to them
  const [askFor, setAskFor] = useState<IUpdateDevice[] | null>(null);
  const setOpenCloudBackupModal = useAppStore(
    (store) => store.setOpenCloudBackupModal
  );
  const setUpdatesNotice = useAppStore((store) => store.setUpdatesNotice);

  const look = useCallback(async () => {
    setState(null);
    setRuns({});
    setAskFor(null);
    try {
      const found = await window.kweenb.methods.checkForUpdates();
      setState(found);
      setUpdatesNotice(noticeOf(found));
    } catch (e) {
      setState({
        kweenb: {
          current: "",
          latest: null,
          available: false,
          message: "Looking for updates failed. Try again.",
        },
        firmware: { hasKey: true, message: null, bee: null, satellite: null },
        devices: [],
      });
    }
  }, [setUpdatesNotice]);

  useEffect(() => {
    if (!open) return undefined;
    setDownload(undefined);
    look();
    return window.kweenb.events.onUpdateProgress((event, progress) => {
      if (progress.key === "kweenb")
        setDownload((now) => ({ ...now, ...progress }));
      else
        setRuns((now) => ({
          ...now,
          [progress.key]: { step: progress.step, message: progress.message },
        }));
    });
  }, [open, look]);

  const busy =
    Object.values(runs).some(
      (run) => run.step === "sending" || run.step === "restarting"
    ) || download?.step === "sending";

  const update = async (devices: IUpdateDevice[]) => {
    setAskFor(null);
    setRuns((now) => ({
      ...now,
      ...Object.fromEntries(
        devices.map((device) => [device.key, { step: "sending" as const }])
      ),
    }));
    await Promise.all(
      devices.map(async (device) => {
        const answer = await window.kweenb.methods
          .updateDevice(device.key)
          .catch(() => ({ success: false, message: "The update failed." }));
        setRuns((now) => ({
          ...now,
          [device.key]: answer.success
            ? { step: "done" }
            : { step: "failed", message: answer.message },
        }));
        if (answer.success)
          setState((now) => {
            if (!now) return now;
            const next = {
              ...now,
              devices: now.devices.map((other) =>
                other.key === device.key
                  ? {
                      ...other,
                      firmware: device.target,
                      state: "current" as const,
                      target: null,
                      why: null,
                      playing: false,
                    }
                  : other
              ),
            };
            setUpdatesNotice(noticeOf(next));
            return next;
          });
      })
    );
  };

  // sound that is streaming stops: ask first
  const ask = (devices: IUpdateDevice[]) => {
    if (devices.some((device) => device.playing)) setAskFor(devices);
    else update(devices);
  };

  const downloadKweenB = async () => {
    setDownload({ step: "sending", percentage: 0 });
    const answer = await window.kweenb.methods
      .downloadKweenB()
      .catch(() => ({ success: false, message: "The download failed." }));
    setDownload(
      answer.success
        ? { step: "done", message: answer.message }
        : { step: "failed", message: answer.message }
    );
  };

  const updatable = (state?.devices || []).filter(
    (device) => canUpdate(device) && runs[device.key]?.step !== "done"
  );
  const offers = [
    state?.firmware.bee ? `bees ${state.firmware.bee.version}` : null,
    state?.firmware.satellite
      ? `satellite ${state.firmware.satellite.version}`
      : null,
  ].filter((offer): offer is string => offer !== null);

  const actionOf = (device: IUpdateDevice) => {
    const run = runs[device.key];
    if (run?.step === "sending")
      return <Typography variant="small">Sending the firmware…</Typography>;
    if (run?.step === "restarting")
      return (
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography variant="small">
            Restarting, about a minute…
          </Typography>
          <LinearProgress />
        </Box>
      );
    if (run?.step === "done")
      return <Typography variant="small">Updated ✓</Typography>;
    if (device.state === "current")
      return <Typography variant="small">Up to date</Typography>;
    if (device.state === "no-offer")
      return <Typography variant="small">—</Typography>;
    if (device.state === "needs-image")
      return (
        <Typography variant="small" color="error">
          {device.why}
        </Typography>
      );
    return (
      <Box display="flex" flexDirection="column" gap={0.5} alignItems="start">
        {run?.step === "failed" && (
          <Typography variant="small" color="error">
            {run.message}
          </Typography>
        )}
        {device.batteryLow ? (
          <Typography variant="small" color="error">
            Its battery is low. Charge it before updating.
          </Typography>
        ) : (
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
            buttonUse={ButtonUse.Normal}
            disabled={askFor !== null}
            onClick={() => ask([device])}
          >
            {device.state === "restart"
              ? "Restart to finish"
              : run?.step === "failed"
              ? "Try again"
              : `Update to ${device.target}`}
          </Button>
        )}
        {device.why && run?.step !== "failed" && (
          <Typography variant="small">{device.why}</Typography>
        )}
      </Box>
    );
  };

  return (
    <BaseModal
      title="Check for updates"
      open={open}
      onClose={busy ? () => {} : onClose}
      disableBackdropClick={busy}
      showCloseButton={!busy}
      width="760px"
    >
      {state === null && (
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="small">
            Looking for a new KweenB, new firmware, and the bees and satellites
            on the network…
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {state !== null && (
        <Box display="flex" flexDirection="column" gap={2}>
          {/* KweenB itself */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">KweenB</Typography>
            {state.kweenb.available ? (
              <Typography>
                KweenB {state.kweenb.latest} is available. This is{" "}
                {state.kweenb.current}.
              </Typography>
            ) : (
              <Typography>
                {state.kweenb.message ||
                  `This is KweenB ${state.kweenb.current}, the newest version.`}
              </Typography>
            )}
            {download?.step === "sending" && (
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography variant="small">
                  Downloading… {download.percentage || 0}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={download.percentage || 0}
                />
              </Box>
            )}
            {download?.step === "done" && (
              <Typography variant="small">
                The new KweenB is in your Downloads folder and is opened. Quit
                KweenB, then put the new one in place of the old one.
              </Typography>
            )}
            {download?.step === "failed" && (
              <Typography variant="small" color="error">
                {download.message}
              </Typography>
            )}
            {state.kweenb.available && download?.step !== "sending" && (
              <Box>
                <Button
                  type="button"
                  buttonSize={ButtonSize.Small}
                  buttonType={ButtonType.Primary}
                  buttonUse={ButtonUse.Normal}
                  onClick={downloadKweenB}
                >
                  {`Download KweenB ${state.kweenb.latest}`}
                </Button>
              </Box>
            )}
          </Box>

          {/* the firmware KweenB has for the devices */}
          <Section>
            <Typography variant="h6">Bees and satellites</Typography>
            {!state.firmware.hasKey && (
              <>
                <Typography>
                  New firmware only shows when a backup key is installed.
                </Typography>
                <Typography variant="small">
                  The firmware for the bees and the satellite is kept with the
                  backups in the cloud of aifoon, which KweenB can only reach
                  with a backup key.
                  {offers.length > 0 &&
                    ` Until then KweenB uses the firmware that is on this computer already (${offers.join(
                      ", "
                    )}).`}
                </Typography>
                <Box>
                  <Button
                    type="button"
                    buttonSize={ButtonSize.Small}
                    buttonType={ButtonType.Primary}
                    buttonUse={ButtonUse.Normal}
                    disabled={busy}
                    onClick={() => {
                      onClose();
                      setOpenCloudBackupModal(true);
                    }}
                  >
                    Install a Backup Key…
                  </Button>
                </Box>
              </>
            )}
            {state.firmware.hasKey && (
              <Typography variant="small">
                {offers.length > 0
                  ? `Newest firmware: ${offers.join(", ")}.`
                  : "There is no firmware in the cloud yet."}
              </Typography>
            )}
            {state.firmware.message && (
              <Typography variant="small" color="error">
                {state.firmware.message}
              </Typography>
            )}

            {state.devices.length === 0 ? (
              <Typography>
                No bees or satellites are on the network right now.
              </Typography>
            ) : (
              <Table>
                <Head variant="small">On the network</Head>
                <Head variant="small">Image</Head>
                <Head variant="small">Firmware</Head>
                <Head variant="small" />
                {state.devices.map((device) => [
                  <Typography key={`${device.key}-name`}>
                    {device.name}
                    {device.kind === "satellite" ? " (satellite)" : ""}
                  </Typography>,
                  <Typography key={`${device.key}-image`} variant="small">
                    {device.image || "older"}
                  </Typography>,
                  <Typography key={`${device.key}-firmware`} variant="small">
                    {device.firmware || "—"}
                  </Typography>,
                  <Box key={`${device.key}-action`}>{actionOf(device)}</Box>,
                ])}
              </Table>
            )}

            {askFor !== null && (
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography color="error">
                  {askFor.filter((d) => d.playing).length === 1
                    ? `Sound is streaming to ${
                        askFor.find((d) => d.playing)?.name
                      }. Updating stops its sound for about a minute.`
                    : `Sound is streaming to ${
                        askFor.filter((d) => d.playing).length
                      } of these. Updating stops their sound for about a minute.`}
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    type="button"
                    buttonSize={ButtonSize.Small}
                    buttonType={ButtonType.TertiaryWhite}
                    onClick={() => setAskFor(null)}
                  >
                    Not now
                  </Button>
                  <Button
                    type="button"
                    buttonSize={ButtonSize.Small}
                    buttonType={ButtonType.Primary}
                    buttonUse={ButtonUse.Normal}
                    onClick={() => update(askFor)}
                  >
                    Stop the sound and update
                  </Button>
                </Box>
              </Box>
            )}
          </Section>
        </Box>
      )}

      <ConfirmModalFooter>
        <Button
          type="button"
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.TertiaryWhite}
          onClick={onClose}
          disabled={busy}
        >
          Close
        </Button>
        {state !== null && (
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.TertiaryWhite}
            onClick={look}
            disabled={busy}
          >
            Look again
          </Button>
        )}
        {updatable.length > 1 && (
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
            buttonUse={ButtonUse.Normal}
            disabled={busy || askFor !== null}
            onClick={() => ask(updatable)}
          >
            {`Update all (${updatable.length})`}
          </Button>
        )}
      </ConfirmModalFooter>
    </BaseModal>
  );
};
