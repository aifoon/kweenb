import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import {
  IRestoreSoundsResult,
  ISoundBackup,
  ISoundsProgress,
} from "@shared/interfaces";
import { beeNameInWords } from "./SaveSoundsModal";

interface RestoreSoundsModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {
  // the bee that gets its saved sounds back
  beeId: number;
  beeName: string;
}

/**
 * Puts the sounds that were saved on this computer back on a bee, for
 * example after it was flashed or when the putting back was interrupted.
 */
export const RestoreSoundsModal = ({
  open,
  onClose,
  beeId,
  beeName,
}: RestoreSoundsModalProps) => {
  // undefined while looking, null when this bee has no saved sounds
  const [backup, setBackup] = useState<ISoundBackup | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [progress, setProgress] = useState<ISoundsProgress | null>(null);
  const [result, setResult] = useState<IRestoreSoundsResult | null>(null);

  useEffect(() => {
    if (!open) return undefined;

    // start with a clean sheet
    let closed = false;
    setBackup(undefined);
    setBusy(false);
    setStopping(false);
    setProgress(null);
    setResult(null);

    window.kweenb.methods
      .getSoundBackups()
      .then((backups) => {
        if (!closed)
          setBackup(backups.find(({ name }) => name === beeName) || null);
      })
      .catch(() => {
        if (!closed) setBackup(null);
      });

    const removeListener = window.kweenb.events.onSoundsProgress(
      (event, soundsProgress) => {
        if (!closed && soundsProgress.action === "restore")
          setProgress(soundsProgress);
      }
    );

    return () => {
      closed = true;
      removeListener();
    };
  }, [open, beeName]);

  const handleStart = () => {
    setBusy(true);
    window.kweenb.methods
      .restoreSounds(beeId, beeName)
      .then(setResult)
      .catch(() =>
        setResult({
          success: false,
          sounds: 0,
          cancelled: false,
          message:
            "The sounds could not be put back. Check that the speaker is switched on and try again.",
        })
      );
  };

  const handleStop = () => {
    setStopping(true);
    window.kweenb.actions.cancelSounds();
  };

  const bee = beeNameInWords(beeName);

  return (
    <BaseModal
      title="Put saved sounds back"
      disableBackdropClick
      showCloseButton={false}
      open={open}
      onClose={onClose}
    >
      <Box display={"flex"} flexDirection={"column"} gap={1}>
        {backup === undefined && (
          <Typography variant="small">Looking for saved sounds…</Typography>
        )}
        {backup === null && (
          <Typography>
            There are no saved sounds of {bee} on this computer.
          </Typography>
        )}
        {backup && !busy && (
          <>
            <Typography>
              Put the sounds of {bee} back on the speaker?
            </Typography>
            <Typography variant="small">
              {`${backup.sounds} sounds, saved on ${new Date(
                backup.date
              ).toLocaleString()}. Sounds that are already on the speaker are left as they are.`}
            </Typography>
          </>
        )}
        {busy && !result && (
          <>
            <Typography variant="small">
              {stopping && "Stopping…"}
              {!stopping && !progress && "Comparing with the speaker…"}
              {!stopping &&
                progress &&
                `Putting sounds back (${progress.current} of ${progress.total})…`}
            </Typography>
            <LinearProgress
              variant={progress && !stopping ? "determinate" : "indeterminate"}
              value={
                progress && progress.total > 0
                  ? (progress.current / progress.total) * 100
                  : 0
              }
            />
          </>
        )}
        {result && (
          <>
            {result.success && !result.cancelled && (
              <Typography>
                Done. {bee} has its sounds back ({result.sounds} sounds).
              </Typography>
            )}
            {result.cancelled && (
              <Typography>
                Stopped. The sounds that are not on the speaker yet are put
                back the next time.
              </Typography>
            )}
            {result.message && (
              <Typography
                variant="small"
                style={
                  result.success ? undefined : { color: "var(--red-status)" }
                }
              >
                {result.message}
              </Typography>
            )}
          </>
        )}
      </Box>
      <ConfirmModalFooter>
        {(!busy || result) && (
          <Button
            type="button"
            onClick={onClose}
            buttonType={ButtonType.TertiaryWhite}
            buttonSize={ButtonSize.Small}
          >
            Close
          </Button>
        )}
        {backup && !busy && (
          <Button
            type="button"
            onClick={handleStart}
            buttonUse={ButtonUse.Normal}
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
          >
            Put back
          </Button>
        )}
        {busy && !result && (
          <Button
            type="button"
            onClick={handleStop}
            buttonType={ButtonType.TertiaryWhite}
            buttonSize={ButtonSize.Small}
          >
            Stop
          </Button>
        )}
      </ConfirmModalFooter>
    </BaseModal>
  );
};
