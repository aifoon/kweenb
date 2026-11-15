import { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Box,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonType,
  ButtonUse,
} from "@components/Buttons";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import {
  IAdoptSpeakerProgress,
  IAdoptSpeakerResult,
  IFoundSpeaker,
  ISoundBackup,
} from "@shared/interfaces";
import { Utils } from "@shared/utils";
import { useBeeStore } from "@renderer/src/hooks";
import { beeNameInWords } from "../Modals/SaveSoundsModal";

/**
 * Types & constants
 */

type NewSpeakerModalProps = Pick<BaseModalProps, "open" | "onClose">;

type Step = "looking" | "number" | "sounds" | "working" | "done" | "failed";

// which sounds to put on the speaker
type SoundsChoice = "own" | "other" | "none";

// how often we ask which new speakers were found
const LOOKING_INTERVAL_MS = 2000;

// when nothing was found after this long, a hint is shown
const HINT_AFTER_MS = 20000;

/**
 * Styled Components
 */

const FoundSpeaker = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: var(--primary-300);
  border-radius: var(--radiusMedium);
`;

/**
 * Helpers
 */

/**
 * How long ago a speaker was found, in words
 */
const foundInWords = (foundAt: string) => {
  const minutes = Math.floor(
    (Date.now() - new Date(foundAt).getTime()) / 60000
  );
  if (minutes < 1) return "found just now";
  return minutes === 1 ? "found a minute ago" : `found ${minutes} minutes ago`;
};

/**
 * The day sounds were saved, in words
 */
const savedOnInWords = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Describe saved sounds
 */
const backupInWords = ({ name, date, sounds, source }: ISoundBackup) =>
  `Sounds of ${beeNameInWords(name)}, backed up on ${savedOnInWords(
    date
  )}, ${sounds} sounds${source === "cloud" ? " (in the cloud)" : ""}`;

// a backup is known by where it is and whose it is
const backupKey = (backup: ISoundBackup) =>
  `${backup.source || "computer"}:${backup.name}`;

/**
 * What is happening, in words
 */
const progressInWords = (progress: IAdoptSpeakerProgress) => {
  if (progress.step === "number") return "Giving the speaker its number…";
  if (progress.step === "waiting") return "Waiting for it to come back…";
  return progress.total
    ? `Putting sounds back (${progress.current} of ${progress.total})…`
    : "Putting sounds back…";
};

/**
 * A guided way to add a freshly flashed speaker to the swarm: find it, give
 * it its number and put its sounds back.
 */
export const NewSpeakerModal = ({ open, onClose }: NewSpeakerModalProps) => {
  const bees = useBeeStore((state) => state.bees);

  const [step, setStep] = useState<Step>("looking");
  const [newSpeakers, setNewSpeakers] = useState<IFoundSpeaker[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [speaker, setSpeaker] = useState<IFoundSpeaker | null>(null);
  const [number, setNumber] = useState(1);
  const [backups, setBackups] = useState<ISoundBackup[]>([]);
  const [soundsChoice, setSoundsChoice] = useState<SoundsChoice>("none");
  const [otherBackupKey, setOtherBackupKey] = useState("");
  const [progress, setProgress] = useState<IAdoptSpeakerProgress>({
    step: "number",
  });
  const [result, setResult] = useState<IAdoptSpeakerResult | null>(null);

  /**
   * What we know about the chosen number
   */

  const numberIsValid = Number.isInteger(number) && number >= 1 && number <= 99;
  const beeWithNumber = bees.find((bee) => bee.id === number);
  const backupName = `bee${Utils.addLeadingZero(number)}`;
  // the backup of this bee itself: the one in the cloud when there is one,
  // as that is the newest
  const ownBackup = backups.find((backup) => backup.name === backupName);
  const otherBackups = backups.filter((backup) => backup !== ownBackup);

  // the backup that was chosen
  const chosenBackup = (): ISoundBackup | null => {
    if (soundsChoice === "own" && ownBackup) return ownBackup;
    if (soundsChoice === "other")
      return (
        otherBackups.find((backup) => backupKey(backup) === otherBackupKey) ||
        null
      );
    return null;
  };
  const chosenBackupName = () => chosenBackup()?.name || null;

  /**
   * Start over whenever the modal opens, stop looking when it closes
   */
  useEffect(() => {
    if (!open) return undefined;
    setStep("looking");
    setNewSpeakers([]);
    setSpeaker(null);
    setResult(null);
    return () => window.kweenb.actions.stopLookingForSpeakers();
  }, [open]);

  /**
   * Step 1: look for new speakers
   */
  useEffect(() => {
    if (!open || step !== "looking") return undefined;
    let stopped = false;
    setShowHint(false);

    const look = async () => {
      try {
        const found = await window.kweenb.methods.findNewSpeakers();
        if (!stopped) setNewSpeakers(found);
      } catch (e) {
        // try again in a moment
      }
    };
    look();
    const lookingInterval = window.setInterval(look, LOOKING_INTERVAL_MS);
    const hintTimeout = window.setTimeout(
      () => setShowHint(true),
      HINT_AFTER_MS
    );

    return () => {
      stopped = true;
      window.clearInterval(lookingInterval);
      window.clearTimeout(hintTimeout);
    };
  }, [open, step]);

  /**
   * Follow what is happening while the speaker is set up
   */
  useEffect(() => {
    if (!open) return undefined;
    const removeAdoptListener = window.kweenb.events.onAdoptSpeakerProgress(
      (event, adoptSpeakerProgress) => setProgress(adoptSpeakerProgress)
    );
    // putting the sounds back once more (see handleSoundsAgain)
    const removeSoundsListener = window.kweenb.events.onSoundsProgress(
      (event, { current, total }) =>
        setProgress({ step: "sounds", current, total })
    );
    return () => {
      removeAdoptListener();
      removeSoundsListener();
    };
  }, [open]);

  /**
   * Step 1 -> 2: a speaker was chosen, propose the lowest free number
   */
  const handleSpeakerChosen = (foundSpeaker: IFoundSpeaker) => {
    let lowestFreeNumber = 1;
    while (
      lowestFreeNumber < 99 &&
      bees.some((bee) => bee.id === lowestFreeNumber)
    )
      lowestFreeNumber += 1;
    setSpeaker(foundSpeaker);
    setNumber(lowestFreeNumber);
    setStep("number");
  };

  /**
   * Step 2 -> 3: the number was chosen, look which sounds were saved
   */
  const handleNumberChosen = async () => {
    // the backups in the cloud (when a backup key is installed) come
    // first: they are the newest
    const [inCloud, onComputer] = await Promise.all([
      window.kweenb.methods.getCloudSoundSets().catch(() => []),
      window.kweenb.methods.getSoundBackups().catch(() => []),
    ]);
    const savedSounds: ISoundBackup[] = [...inCloud, ...onComputer];
    const own = savedSounds.find((backup) => backup.name === backupName);
    const others = savedSounds.filter((backup) => backup !== own);
    setBackups(savedSounds);
    setSoundsChoice(own ? "own" : "none");
    setOtherBackupKey(others.length > 0 ? backupKey(others[0]) : "");
    setStep("sounds");
  };

  /**
   * Step 3 -> the work: give the number, wait for the speaker, put the sounds back
   */
  const handleStart = async () => {
    if (!speaker) return;
    setProgress({ step: "number" });
    setStep("working");
    let adoptSpeakerResult: IAdoptSpeakerResult;
    try {
      adoptSpeakerResult = await window.kweenb.methods.adoptSpeaker({
        ipAddress: speaker.ipAddress,
        id: number,
        backupName: chosenBackupName(),
        backupSource: chosenBackup()?.source || "computer",
      });
    } catch (e) {
      adoptSpeakerResult = {
        numberGiven: false,
        cameBack: false,
        soundsRestored: false,
        sounds: 0,
        message: "Something went wrong. Look for the new speaker again.",
      };
    }
    setResult(adoptSpeakerResult);
    setStep(adoptSpeakerResult.numberGiven ? "done" : "failed");
  };

  /**
   * The speaker has its number, but its sounds did not all get there: try again
   */
  const handleSoundsAgain = async () => {
    const name = chosenBackupName();
    if (!result || !name) return;
    setProgress({ step: "sounds" });
    setStep("working");
    try {
      const restored = await (chosenBackup()?.source === "cloud"
        ? window.kweenb.methods.restoreSoundsFromCloud(number, name, false)
        : window.kweenb.methods.restoreSounds(number, name));
      setResult({
        ...result,
        soundsRestored: restored.success,
        sounds: restored.sounds,
        message: restored.message,
      });
    } catch (e) {
      // the message of the first try still stands
    }
    setStep("done");
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

  return (
    <BaseModal
      open={open}
      title="New speaker"
      onClose={onClose}
      disableBackdropClick
      showCloseButton={step !== "working"}
    >
      {/* Step 1: find the speaker */}

      {step === "looking" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>Looking for new speakers…</Typography>
            {newSpeakers.length === 0 && <LinearProgress />}
            {newSpeakers.map((foundSpeaker) => (
              <FoundSpeaker key={foundSpeaker.hostname}>
                <Typography variant="small">
                  New speaker · {foundInWords(foundSpeaker.foundAt)}
                  {newSpeakers.length > 1 &&
                    ` · ${foundSpeaker.hostname.split("-").pop()}`}
                </Typography>
                <Button
                  type="button"
                  onClick={() => handleSpeakerChosen(foundSpeaker)}
                  buttonUse={ButtonUse.Normal}
                  buttonSize={ButtonSize.Small}
                  buttonType={ButtonType.Primary}
                >
                  Set up
                </Button>
              </FoundSpeaker>
            ))}
            {newSpeakers.length === 0 && showHint && (
              <Typography variant="small">
                Is it switched on? A freshly flashed speaker needs about a
                minute.
              </Typography>
            )}
            {newSpeakers.length > 1 && (
              <Typography variant="extraSmall">
                More than one new speaker was found. Switching on one at a time
                makes it easier to tell them apart.
              </Typography>
            )}
          </Box>
          <ConfirmModalFooter>{cancelButton}</ConfirmModalFooter>
        </>
      )}

      {/* Step 2: its number */}

      {step === "number" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={2}>
            <Typography>Which number is this speaker?</Typography>
            <TextField
              size="small"
              label="Number"
              variant="filled"
              type="number"
              name="number"
              inputProps={{ min: 1, max: 99 }}
              value={Number.isNaN(number) ? "" : number}
              onChange={(e) =>
                setNumber(e.target.value === "" ? NaN : Number(e.target.value))
              }
              error={!numberIsValid || !!beeWithNumber?.isOnline}
              helperText={!numberIsValid && "Choose a number from 1 to 99."}
            />
            {numberIsValid && beeWithNumber?.isOnline && (
              <Typography
                variant="small"
                style={{ color: "var(--red-status)" }}
              >
                Bee {number} is already switched on. Two speakers cannot share a
                number.
              </Typography>
            )}
            {numberIsValid && beeWithNumber && !beeWithNumber.isOnline && (
              <Typography variant="small">
                Bee {number} is already in your swarm, but it is switched off.
                It will be replaced by this speaker.
              </Typography>
            )}
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              <Button
                type="button"
                onClick={() => setStep("looking")}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!numberIsValid || !!beeWithNumber?.isOnline}
                style={{
                  opacity: !numberIsValid || beeWithNumber?.isOnline ? 0.5 : 1,
                }}
                onClick={handleNumberChosen}
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

      {/* Step 3: its sounds */}

      {step === "sounds" && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>Put its sounds back?</Typography>
            {backups.length === 0 && (
              <Typography variant="small">
                There is no backup, on this computer or in the cloud, so this
                speaker starts without sounds.
              </Typography>
            )}
            {backups.length > 0 && (
              <RadioGroup
                value={soundsChoice}
                onChange={(e) =>
                  setSoundsChoice(e.target.value as SoundsChoice)
                }
              >
                {ownBackup && (
                  <FormControlLabel
                    value="own"
                    control={<Radio size="small" />}
                    label={backupInWords(ownBackup)}
                  />
                )}
                {otherBackups.length > 0 && (
                  <FormControlLabel
                    value="other"
                    control={<Radio size="small" />}
                    label={
                      ownBackup
                        ? "Sounds of another bee"
                        : "Sounds of a bee that was saved before"
                    }
                  />
                )}
                {soundsChoice === "other" && (
                  <TextField
                    select
                    size="small"
                    variant="filled"
                    label="Saved sounds"
                    SelectProps={{ native: true }}
                    value={otherBackupKey}
                    onChange={(e) => setOtherBackupKey(e.target.value)}
                    style={{ margin: "5px 0 10px 30px" }}
                  >
                    {otherBackups.map((backup) => (
                      <option key={backupKey(backup)} value={backupKey(backup)}>
                        {backupInWords(backup)}
                      </option>
                    ))}
                  </TextField>
                )}
                <FormControlLabel
                  value="none"
                  control={<Radio size="small" />}
                  label="Start without sounds"
                />
              </RadioGroup>
            )}
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              <Button
                type="button"
                onClick={() => setStep("number")}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleStart}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Set up bee {number}
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}

      {/* Doing it */}

      {step === "working" && (
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          <Typography>{progressInWords(progress)}</Typography>
          <LinearProgress
            variant={
              progress.step === "sounds" && progress.total
                ? "determinate"
                : "indeterminate"
            }
            value={
              progress.total
                ? ((progress.current || 0) / progress.total) * 100
                : 0
            }
          />
          <Typography variant="extraSmall">
            Leave the speaker switched on until this is done.
          </Typography>
        </Box>
      )}

      {/* The speaker has its number */}

      {step === "done" && result && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            {!result.message && (
              <Typography>
                Done. This speaker is now bee {number}
                {result.soundsRestored
                  ? ` and has its ${result.sounds} sounds back.`
                  : "."}
              </Typography>
            )}
            {result.message && (
              <>
                <Typography>
                  This speaker is now bee {number}
                  {result.cameBack ? ", but its sounds are not all back." : "."}
                </Typography>
                <Typography
                  variant="small"
                  style={{ color: "var(--red-status)" }}
                >
                  {result.message}
                </Typography>
              </>
            )}
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              {result.message && result.cameBack && chosenBackupName() && (
                <Button
                  type="button"
                  onClick={handleSoundsAgain}
                  buttonType={ButtonType.TertiaryWhite}
                  buttonSize={ButtonSize.Small}
                >
                  Try the sounds again
                </Button>
              )}
              <Button
                type="button"
                onClick={onClose}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Close
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}

      {/* The speaker did not get its number */}

      {step === "failed" && result && (
        <>
          <Box display={"flex"} flexDirection={"column"} gap={1}>
            <Typography>This did not work.</Typography>
            <Typography variant="small" style={{ color: "var(--red-status)" }}>
              {result.message}
            </Typography>
          </Box>
          <ConfirmModalFooter>
            <ButtonGroup>
              {cancelButton}
              <Button
                type="button"
                onClick={() => setStep("looking")}
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Look again
              </Button>
            </ButtonGroup>
          </ConfirmModalFooter>
        </>
      )}
    </BaseModal>
  );
};
