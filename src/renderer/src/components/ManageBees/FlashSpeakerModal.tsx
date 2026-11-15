import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Box, LinearProgress, Typography } from "@mui/material";
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonType,
  ButtonUse,
} from "@components/Buttons";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { IFlashImage, IFlashProgress } from "@shared/interfaces";

/**
 * Types & constants
 */

interface FlashSpeakerModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {
  // the speaker is flashed: go on with giving it its number
  onSetUpSpeaker: () => void;
}

type Step =
  | "image"
  | "connect"
  | "confirm"
  | "working"
  | "done"
  | "stopped"
  | "failed";

// when no speaker was found after this long, a hint is shown
const HINT_AFTER_MS = 20000;

/**
 * Styled Components
 */

const ChosenImage = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 15px;
  background-color: var(--primary-300);
  border-radius: var(--radiusMedium);
`;

const Instructions = styled.ol`
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

/**
 * Helpers
 */

/**
 * A size in words (31.3 GB, 850 MB)
 */
const sizeInWords = (bytes: number) =>
  bytes >= 1e9
    ? `${(bytes / 1e9).toFixed(1)} GB`
    : `${Math.max(1, Math.round(bytes / 1e6))} MB`;

/**
 * What is happening while the speaker is flashed, in words
 */
const progressInWords = (progress: IFlashProgress, stopping: boolean) => {
  if (stopping) return "Stopping…";
  if (progress.step === "writing")
    return `Writing the image… ${progress.percentage || 0}%`;
  if (progress.step === "checking") return "Checking…";
  return "Waiting for your password…";
};

/**
 * A guided way to flash a speaker: choose the image, connect the speaker
 * with a USB cable, write the image and check it. Afterwards the speaker is
 * a new speaker that can be set up.
 */
export const FlashSpeakerModal = ({
  open,
  onClose,
  onSetUpSpeaker,
}: FlashSpeakerModalProps) => {
  const [step, setStep] = useState<Step>("image");
  const [image, setImage] = useState<IFlashImage | null>(null);
  // counts the times we looked for the speaker, so looking can start again
  const [lookingRound, setLookingRound] = useState(0);
  const [progress, setProgress] = useState<IFlashProgress>({
    step: "looking",
  });
  const [showHint, setShowHint] = useState(false);
  const [storageBytes, setStorageBytes] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [message, setMessage] = useState("");

  /**
   * Start over whenever the modal opens (with the image of the last time),
   * stop whatever is going on when it closes
   */
  useEffect(() => {
    if (!open) return undefined;
    let closed = false;
    setStep("image");
    setImage(null);
    setMessage("");
    setStopping(false);
    window.kweenb.methods
      .getLastFlashImage()
      .then((lastImage) => {
        if (!closed && lastImage && !lastImage.message) setImage(lastImage);
      })
      .catch(() => {
        // without a last image one has to be chosen
      });
    return () => {
      closed = true;
      window.kweenb.actions.cancelFlash();
    };
  }, [open]);

  /**
   * Follow what is happening while the speaker is looked for and flashed
   */
  useEffect(() => {
    if (!open) return undefined;
    return window.kweenb.events.onFlashProgress((event, flashProgress) =>
      setProgress(flashProgress)
    );
  }, [open]);

  /**
   * Step 2: look for the speaker as long as this step is shown
   */
  useEffect(() => {
    if (!open || step !== "connect") return undefined;
    let left = false;
    setProgress({ step: "looking" });
    setShowHint(false);
    const hintTimeout = window.setTimeout(
      () => setShowHint(true),
      HINT_AFTER_MS
    );

    window.kweenb.methods
      .findSpeakerToFlash()
      .then((found) => {
        if (left || found.cancelled) return;
        if (found.found) {
          setStorageBytes(found.sizeBytes);
          setStep("confirm");
          return;
        }
        setMessage(found.message || "Something went wrong. Try again.");
        setStep("failed");
      })
      .catch(() => {
        if (left) return;
        setMessage("Something went wrong. Try again.");
        setStep("failed");
      });

    return () => {
      left = true;
      window.clearTimeout(hintTimeout);
      window.kweenb.actions.cancelFlash();
    };
  }, [open, step, lookingRound]);

  /**
   * Step 1: choose the image
   */
  const handleChooseImage = async () => {
    try {
      const chosenImage = await window.kweenb.methods.chooseFlashImage();
      if (chosenImage) setImage(chosenImage);
    } catch (e) {
      // the image that was chosen before still stands
    }
  };

  /**
   * Look for the speaker (again)
   */
  const handleLook = () => {
    setMessage("");
    setLookingRound((round) => round + 1);
    setStep("connect");
  };

  /**
   * Step 3 -> the work: write the image and check it
   */
  const handleFlash = async () => {
    if (!image) return;
    setProgress({ step: "password" });
    setStopping(false);
    setStep("working");
    try {
      const result = await window.kweenb.methods.flashSpeaker(image.path);
      if (result.success) {
        setStep("done");
        return;
      }
      setMessage(result.message || "Something went wrong. Try again.");
      setStep(result.cancelled ? "stopped" : "failed");
    } catch (e) {
      setMessage(
        "Something went wrong. Switch the speaker off and on, and flash it again."
      );
      setStep("failed");
    }
  };

  const handleStop = () => {
    setStopping(true);
    window.kweenb.actions.cancelFlash();
  };

  const cancelButton = (
    <Button
      type="button"
      onClick={onClose}
      buttonType={ButtonType.TertiaryWhite}
      buttonSize={ButtonSize.Small}
    >
      Cancel
    </Button>
  );

  const imageIsUsable = !!image && !image.message;

  return (
    <BaseModal
      open={open}
      title="Flash a speaker"
      onClose={onClose}
      disableBackdropClick
      showCloseButton={step !== "working"}
    >
      {/* Step 1: the image */}

      {step === "image" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>Which image goes on the speaker?</Typography>
            <ChosenImage>
              <Typography variant="small" style={{ wordBreak: "break-all" }}>
                {image
                  ? `${image.name} · ${sizeInWords(image.sizeBytes)}`
                  : "No image chosen yet"}
              </Typography>
              <Button
                type="button"
                onClick={handleChooseImage}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={
                  image ? ButtonType.TertiaryWhite : ButtonType.Primary
                }
              >
                {image ? "Choose another…" : "Choose image…"}
              </Button>
            </ChosenImage>
            {image?.message && (
              <Typography
                variant="small"
                style={{ color: "var(--red-status)" }}
              >
                {image.message}
              </Typography>
            )}
            <Typography variant="extraSmall">
              Flashing puts fresh software on a speaker. Everything that is on
              the speaker now is erased.
            </Typography>
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              {cancelButton}
              <Button
                type="button"
                disabled={!imageIsUsable}
                style={{ opacity: imageIsUsable ? 1 : 0.5 }}
                onClick={handleLook}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Next
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}

      {/* Step 2: connect the speaker */}

      {step === "connect" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>Connect the speaker to this computer.</Typography>
            <Typography variant="small" component="div">
              <Instructions>
                <li>Switch the speaker off and set the jumper.</li>
                <li>Connect the speaker to this computer with a USB cable.</li>
                <li>Switch the speaker on.</li>
              </Instructions>
            </Typography>
            <Typography variant="small">
              {progress.step === "found"
                ? "Speaker found, opening its storage…"
                : "Looking for the speaker…"}
            </Typography>
            <LinearProgress />
            {showHint && progress.step !== "found" && (
              <Typography variant="extraSmall">
                Nothing yet. Is the jumper set, and does the cable go straight
                into this computer? Switching the speaker off and on again can
                help.
              </Typography>
            )}
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              <Button
                type="button"
                onClick={() => setStep("image")}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Back
              </Button>
              {cancelButton}
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}

      {/* Step 3: be sure */}

      {step === "confirm" && image && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>Erase this speaker and flash it?</Typography>
            <Typography variant="small">
              This will be overwritten: the speaker&apos;s storage (
              {sizeInWords(storageBytes)}). Everything on the speaker is erased
              and replaced by {image.name}.
            </Typography>
            <Typography variant="small" style={{ color: "var(--red-status)" }}>
              Was this speaker in use? Save its sounds first. Sounds that were
              not saved to this computer are lost.
            </Typography>
            <Typography variant="extraSmall">
              Your Mac will ask for your password before anything is written.
            </Typography>
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              {cancelButton}
              <Button
                type="button"
                onClick={handleFlash}
                buttonUse={ButtonUse.Danger}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Erase and flash
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}

      {/* Step 4: write and check */}

      {step === "working" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>{progressInWords(progress, stopping)}</Typography>
            <LinearProgress
              variant={
                progress.step === "writing" && !stopping
                  ? "determinate"
                  : "indeterminate"
              }
              value={progress.percentage || 0}
            />
            <Typography variant="extraSmall">
              Leave the speaker switched on and the cable connected until this
              is done. It can take a few minutes.
            </Typography>
          </Box>
          <ConfirmModalFooter>
            <Button
              type="button"
              disabled={stopping}
              style={{ opacity: stopping ? 0.5 : 1 }}
              onClick={handleStop}
              buttonType={ButtonType.TertiaryWhite}
              buttonSize={ButtonSize.Small}
            >
              Stop
            </Button>
          </ConfirmModalFooter>
        </>
      )}

      {/* Step 5: done */}

      {step === "done" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>Done. The speaker is flashed.</Typography>
            <Typography variant="small">
              Remove the jumper, unplug the USB cable and switch the speaker on.
              It will appear as a new speaker in about a minute.
            </Typography>
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              <Button
                type="button"
                onClick={onClose}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={onSetUpSpeaker}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Set up this speaker
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}

      {/* Stopped, or it did not work */}

      {(step === "stopped" || step === "failed") && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            {step === "failed" && <Typography>This did not work.</Typography>}
            <Typography
              variant={step === "failed" ? "small" : undefined}
              style={step === "failed" ? { color: "var(--red-status)" } : {}}
            >
              {message}
            </Typography>
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              {cancelButton}
              <Button
                type="button"
                onClick={handleLook}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Try again
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}
    </BaseModal>
  );
};
