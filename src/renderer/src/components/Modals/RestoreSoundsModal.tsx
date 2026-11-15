import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import {
  IBee,
  ICloudProgress,
  IRestoreSoundsResult,
  ISoundBackup,
  ISoundsProgress,
} from "@shared/interfaces";
import { beeNameInWords } from "./SaveSoundsModal";

interface RestoreSoundsModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {
  // where the sounds come from: the backup in the cloud or on this computer
  source: "cloud" | "computer";
}

/**
 * A moment in words (15 Nov 14:10)
 */
const momentInWords = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0)
    return "an unknown moment";
  const two = (n: number) => String(n).padStart(2, "0");
  const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  return `${date.getDate()} ${months[date.getMonth()]} ${two(
    date.getHours()
  )}:${two(date.getMinutes())}`;
};

const keyOf = (set: ISoundBackup) => `${set.source || "computer"}:${set.name}`;

const setInWords = (set: ISoundBackup): string =>
  `${beeNameInWords(set.name)}, ${set.sounds} sound${
    set.sounds === 1 ? "" : "s"
  }, backed up on ${momentInWords(set.date)}`;

// what happened to a bee
interface Outcome {
  beeId: number;
  name: string;
  result: IRestoreSoundsResult;
}

/**
 * Restores several bees at once from a backup, in the cloud or on this
 * computer: every bee gets its own sounds back, or those of another bee.
 */
export const RestoreSoundsModal = ({
  open,
  onClose,
  source,
}: RestoreSoundsModalProps) => {
  const fromCloud = source === "cloud";
  // undefined while looking
  const [bees, setBees] = useState<IBee[] | undefined>();
  const [sets, setSets] = useState<ISoundBackup[]>([]);
  // the bees that are ticked, and the sounds chosen per bee
  const [ticked, setTicked] = useState<number[]>([]);
  const [chosen, setChosen] = useState<Record<number, string>>({});
  // also take the sounds off the bees that are not in the saved sounds
  const [exact, setExact] = useState(false);
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState("");
  const [progress, setProgress] = useState<ISoundsProgress | null>(null);
  const [cloudProgress, setCloudProgress] = useState<ICloudProgress | null>(
    null
  );
  const [outcomes, setOutcomes] = useState<Outcome[] | null>(null);
  const stopped = useRef(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    // start with a clean sheet
    let closed = false;
    setBees(undefined);
    setSets([]);
    setTicked([]);
    setChosen({});
    setExact(false);
    setBusy(false);
    setCurrent("");
    setProgress(null);
    setCloudProgress(null);
    setOutcomes(null);
    setStopping(false);
    stopped.current = false;

    Promise.all([
      window.kweenb.methods.fetchAllBees().catch(() => [] as IBee[]),
      (source === "cloud"
        ? window.kweenb.methods.getCloudSoundSets()
        : window.kweenb.methods.getSoundBackups()
      ).catch(() => [] as ISoundBackup[]),
    ]).then(([allBees, found]) => {
      if (closed) return;
      const all = [...found].sort((a, b) => a.name.localeCompare(b.name));
      const sorted = [...allBees].sort((a, b) => a.id - b.id);
      // every bee starts with its own sounds, when there are any
      const own: Record<number, string> = {};
      sorted.forEach((bee) => {
        const set = all.find(({ name }) => name === bee.name);
        if (set) own[bee.id] = keyOf(set);
      });
      setSets(all);
      setChosen(own);
      setBees(sorted);
    });

    const removeListener = window.kweenb.events.onSoundsProgress(
      (event, soundsProgress) => {
        if (!closed && soundsProgress.action === "restore")
          setProgress(soundsProgress);
      }
    );
    const removeCloudListener = window.kweenb.events.onCloudProgress(
      (event, progressOfCloud) => {
        if (!closed) setCloudProgress(progressOfCloud);
      }
    );

    return () => {
      closed = true;
      removeListener();
      removeCloudListener();
    };
  }, [open, source]);

  const setOf = (bee: IBee) =>
    sets.find((set) => keyOf(set) === chosen[bee.id]);
  // a bee can get sounds when it is switched on and sounds are chosen for it
  const ready = (bee: IBee) => bee.isOnline && setOf(bee) !== undefined;
  const todo = (bees || []).filter(
    (bee) => ticked.includes(bee.id) && ready(bee)
  );
  const selectable = (bees || []).filter(ready);

  const tick = (beeId: number) =>
    setTicked((before) =>
      before.includes(beeId)
        ? before.filter((id) => id !== beeId)
        : [...before, beeId]
    );

  /**
   * One bee after the other: together they would only share the network
   */
  const handleStart = async () => {
    setBusy(true);
    const done: Outcome[] = [];
    for (const bee of todo) {
      if (stopped.current) break;
      const set = setOf(bee) as ISoundBackup;
      setCurrent(bee.name);
      setProgress(null);
      setCloudProgress(null);
      let result: IRestoreSoundsResult;
      try {
        // eslint-disable-next-line no-await-in-loop
        result = await (set.source === "cloud"
          ? window.kweenb.methods.restoreSoundsFromCloud(
              bee.id,
              set.name,
              exact
            )
          : window.kweenb.methods.restoreSounds(bee.id, set.name, exact));
      } catch (e) {
        result = {
          success: false,
          sounds: 0,
          cancelled: false,
          message: "It could not be reached. Check that it is switched on.",
        };
      }
      done.push({ beeId: bee.id, name: bee.name, result });
      if (result.cancelled) break;
    }
    setOutcomes(done);
  };

  const handleStop = () => {
    stopped.current = true;
    setStopping(true);
    window.kweenb.actions.cancelCloud();
    window.kweenb.actions.cancelSounds();
  };

  return (
    <BaseModal
      title={
        fromCloud ? "Restore from the cloud" : "Restore from this computer"
      }
      disableBackdropClick
      showCloseButton={false}
      open={open}
      onClose={onClose}
    >
      <Box display={"flex"} flexDirection={"column"} gap={1.5}>
        {bees === undefined && (
          <Typography variant="small">
            {fromCloud
              ? "Looking at the backup in the cloud…"
              : "Looking at the backup on this computer…"}
          </Typography>
        )}
        {bees && sets.length === 0 && (
          <Typography>
            {fromCloud
              ? "The cloud holds no backup, or it can not be reached. Check that this computer has internet."
              : "There is no backup on this computer. Use File → Back Up → Back Up to This Computer first."}
          </Typography>
        )}
        {bees && sets.length > 0 && !busy && (
          <>
            <Box display={"flex"} alignItems={"center"} gap={2}>
              <Typography variant="small" style={{ flex: 1 }}>
                Tick the bees to restore.
              </Typography>
              <Typography
                variant="small"
                style={{ cursor: "pointer", opacity: 0.8 }}
                onClick={() =>
                  setTicked(
                    ticked.length === selectable.length
                      ? []
                      : selectable.map((bee) => bee.id)
                  )
                }
              >
                {ticked.length === selectable.length && selectable.length > 0
                  ? "none"
                  : "all"}
              </Typography>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              gap={0.75}
              style={{ maxHeight: 280, overflowY: "auto" }}
            >
              {bees.map((bee) => (
                <Box
                  key={bee.id}
                  display={"flex"}
                  alignItems={"center"}
                  gap={1}
                  style={{ opacity: bee.isOnline ? 1 : 0.5 }}
                >
                  <input
                    type="checkbox"
                    disabled={!ready(bee)}
                    checked={ticked.includes(bee.id) && ready(bee)}
                    onChange={() => tick(bee.id)}
                    style={{ flex: "none", width: "auto", margin: 0 }}
                  />
                  <Typography
                    variant="small"
                    style={{ width: 62, flex: "none" }}
                  >
                    {beeNameInWords(bee.name)}
                  </Typography>
                  {!bee.isOnline ? (
                    <Typography variant="extraSmall">switched off</Typography>
                  ) : (
                    <select
                      value={chosen[bee.id] || ""}
                      onChange={(event) =>
                        setChosen({ ...chosen, [bee.id]: event.target.value })
                      }
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      {!chosen[bee.id] && (
                        <option value="">no backup of this bee</option>
                      )}
                      {sets.map((set) => (
                        <option key={keyOf(set)} value={keyOf(set)}>
                          {setInWords(set)}
                        </option>
                      ))}
                    </select>
                  )}
                </Box>
              ))}
            </Box>
            <Box
              display={"flex"}
              alignItems={"flex-start"}
              gap={1}
              style={{ cursor: "pointer" }}
              onClick={() => setExact(!exact)}
            >
              <input
                type="checkbox"
                checked={exact}
                onChange={() => setExact(!exact)}
                style={{ flex: "none", width: "auto", margin: "4px 0 0" }}
              />
              <Box>
                <Typography variant="small">
                  Make the bees exactly like their backup
                </Typography>
                <Typography
                  variant="extraSmall"
                  display="block"
                  style={
                    exact ? { color: "var(--orange-status)" } : { opacity: 0.7 }
                  }
                >
                  {exact
                    ? "Sounds that are on a bee now but not in its backup are removed from it."
                    : "Off: sounds that are already on a bee stay there."}
                </Typography>
              </Box>
            </Box>
            {fromCloud && (
              <Typography variant="extraSmall">
                This computer has to reach the bees and the internet at the same
                time.
              </Typography>
            )}
          </>
        )}
        {busy && !outcomes && (
          <>
            <Typography variant="small">
              {stopping && "Stopping…"}
              {!stopping &&
                !progress &&
                cloudProgress &&
                `${beeNameInWords(
                  current
                )}: getting its sounds from the cloud (file ${
                  cloudProgress.current
                } of ${cloudProgress.total})…`}
              {!stopping &&
                !progress &&
                !cloudProgress &&
                `${beeNameInWords(current)}: comparing…`}
              {!stopping &&
                progress &&
                `${beeNameInWords(current)}: putting sounds on it (${
                  progress.current
                } of ${progress.total})…`}
            </Typography>
            <LinearProgress
              variant={
                !stopping && (progress || cloudProgress)
                  ? "determinate"
                  : "indeterminate"
              }
              value={
                progress && progress.total > 0
                  ? (progress.current / progress.total) * 100
                  : cloudProgress && cloudProgress.totalBytes > 0
                  ? (cloudProgress.doneBytes / cloudProgress.totalBytes) * 100
                  : 0
              }
            />
            <Typography variant="extraSmall">
              {`Bee ${todo.findIndex((bee) => bee.name === current) + 1} of ${
                todo.length
              }`}
            </Typography>
          </>
        )}
        {outcomes && (
          <Box display={"flex"} flexDirection={"column"} gap={0.5}>
            {outcomes.length < todo.length && (
              <Typography>
                Stopped. The bees that were not done yet can be done the next
                time.
              </Typography>
            )}
            {outcomes.map(({ beeId, name, result }) => (
              <Typography
                key={beeId}
                variant="small"
                style={
                  result.success ? undefined : { color: "var(--red-status)" }
                }
              >
                {result.success
                  ? `${beeNameInWords(name)} has its sounds (${
                      result.sounds
                    } sounds)${
                      result.removed ? `, ${result.removed} removed` : ""
                    }.`
                  : `${beeNameInWords(name)}: ${result.message || "Stopped."}`}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
      <ConfirmModalFooter>
        {(!busy || outcomes) && (
          <Button
            type="button"
            onClick={onClose}
            buttonType={ButtonType.TertiaryWhite}
            buttonSize={ButtonSize.Small}
          >
            Close
          </Button>
        )}
        {bees && sets.length > 0 && !busy && (
          <Button
            type="button"
            disabled={todo.length === 0}
            onClick={handleStart}
            buttonUse={ButtonUse.Normal}
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
          >
            {todo.length === 1
              ? "Restore 1 bee"
              : `Restore ${todo.length} bees`}
          </Button>
        )}
        {busy && !outcomes && (
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
