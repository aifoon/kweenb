import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { ISaveSoundsResult, ISoundsProgress } from "@shared/interfaces";

interface SaveSoundsModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {
  // the number of the bee to save, every bee that is switched on when left out
  beeId?: number;
}

/**
 * Write the name of a bee as it is spoken (bee07 becomes bee 07)
 */
export const beeNameInWords = (name: string) =>
  name.replace(/^bee(\d+)$/, "bee $1");

/**
 * Saves the sounds of one bee, or of every bee that is switched on, on this
 * computer. Saving starts as soon as the modal opens.
 */
export const SaveSoundsModal = ({
  open,
  onClose,
  beeId,
}: SaveSoundsModalProps) => {
  const [progress, setProgress] = useState<ISoundsProgress | null>(null);
  const [result, setResult] = useState<ISaveSoundsResult | null>(null);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    // start with a clean sheet
    let closed = false;
    setProgress(null);
    setResult(null);
    setStopping(false);

    const removeListener = window.kweenb.events.onSoundsProgress(
      (event, soundsProgress) => {
        if (!closed) setProgress(soundsProgress);
      }
    );

    window.kweenb.methods
      .saveSounds(beeId ? [beeId] : undefined)
      .then((saveSoundsResult) => {
        if (!closed) setResult(saveSoundsResult);
      })
      .catch(() => {
        if (!closed)
          setResult({
            folder: "",
            saved: [],
            failed: [],
            cancelled: false,
            message: "The sounds could not be saved. Try again.",
          });
      });

    return () => {
      closed = true;
      removeListener();
    };
  }, [open, beeId]);

  const handleStop = () => {
    setStopping(true);
    window.kweenb.actions.cancelSounds();
  };

  /**
   * What was saved, in one sentence
   */
  const savedInWords = ({ saved }: ISaveSoundsResult) => {
    if (saved.length === 0) return "";
    if (saved.length === 1)
      return `The sounds of ${beeNameInWords(
        saved[0].name
      )} are saved on this computer (${saved[0].sounds} sounds).`;
    return `The sounds of ${saved.length} speakers are saved on this computer.`;
  };

  return (
    <BaseModal
      title="Back up to this computer"
      disableBackdropClick
      showCloseButton={false}
      open={open}
      onClose={onClose}
    >
      {!result && (
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          <Typography variant="small">
            {stopping && "Stopping…"}
            {!stopping && !progress && "Looking at the sounds on the speakers…"}
            {!stopping &&
              progress &&
              `Saving the sounds of ${beeNameInWords(progress.name)} (${
                progress.current
              } of ${progress.total})…`}
          </Typography>
          <LinearProgress
            variant={progress && !stopping ? "determinate" : "indeterminate"}
            value={
              progress && progress.total > 0
                ? (progress.current / progress.total) * 100
                : 0
            }
          />
          <Typography variant="extraSmall">
            The first time this can take a while. Next time only new and changed
            sounds are saved.
          </Typography>
        </Box>
      )}
      {result && (
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          {result.message && <Typography>{result.message}</Typography>}
          {result.cancelled && (
            <Typography>
              Stopped. The sounds that were not saved yet are saved the next
              time.
            </Typography>
          )}
          {result.saved.length > 0 && (
            <>
              <Typography>{savedInWords(result)}</Typography>
              <Typography variant="small">
                You find them in this folder: {result.folder}
              </Typography>
            </>
          )}
          {result.failed.map(({ name, message }) => (
            <Typography
              key={name}
              variant="small"
              style={{ color: "var(--red-status)" }}
            >
              {`${beeNameInWords(name)} was not saved. ${message}`}
            </Typography>
          ))}
        </Box>
      )}
      <ConfirmModalFooter>
        {!result && (
          <Button
            type="button"
            onClick={handleStop}
            buttonType={ButtonType.TertiaryWhite}
            buttonSize={ButtonSize.Small}
          >
            Stop
          </Button>
        )}
        {result && (
          <Button
            type="button"
            onClick={onClose}
            buttonUse={ButtonUse.Normal}
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
          >
            Close
          </Button>
        )}
      </ConfirmModalFooter>
    </BaseModal>
  );
};
