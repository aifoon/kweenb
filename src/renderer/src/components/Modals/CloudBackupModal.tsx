import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { useCallback, useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import {
  ICloudBackupState,
  ICloudBee,
  ICloudProgress,
  ICloudSettings,
  ISoundsProgress,
  ISwarmBackupResult,
} from "@shared/interfaces";
import { beeNameInWords } from "./SaveSoundsModal";

type CloudBackupModalProps = Pick<BaseModalProps, "open" | "onClose">;

/**
 * A size in words (340 MB, 1.2 GB)
 */
const sizeInWords = (bytes: number): string => {
  const megaBytes = bytes / (1024 * 1024);
  if (megaBytes >= 1024) return `${(megaBytes / 1024).toFixed(1)} GB`;
  if (megaBytes >= 1) return `${Math.round(megaBytes)} MB`;
  return "less than 1 MB";
};

const filesInWords = (files: number): string =>
  `${files} file${files === 1 ? "" : "s"}`;

/**
 * A moment in words (15 Nov 14:10)
 */
const momentInWords = (iso: string | null): string => {
  if (!iso) return "an unknown moment";
  const date = new Date(iso);
  const two = (n: number) => String(n).padStart(2, "0");
  const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  return `${date.getDate()} ${months[date.getMonth()]} ${two(
    date.getHours()
  )}:${two(date.getMinutes())}`;
};

const soundsInWords = (sounds: number): string =>
  `${sounds} sound${sounds === 1 ? "" : "s"}`;

/**
 * How the cloud stands for a bee, in one line
 */
const beeInWords = (bee: ICloudBee): { text: string; behind: boolean } => {
  const name = beeNameInWords(bee.name);
  if (bee.here === 0)
    return {
      text: `${name}: only in the cloud (${soundsInWords(
        bee.inCloud
      )}, read from the bee on ${momentInWords(bee.cloudSavedAt)})`,
      behind: false,
    };
  const here = `${name}: ${soundsInWords(
    bee.here
  )}, read from the bee on ${momentInWords(bee.hereSavedAt)}`;
  if (bee.cloudIsCurrent)
    return { text: `${here}. The cloud is up to date.`, behind: false };
  return {
    text:
      bee.inCloud === 0
        ? `${here}. Not in the cloud yet.`
        : bee.cloudSavedAt
        ? `${here}. The cloud still has the sounds of ${momentInWords(
            bee.cloudSavedAt
          )}.`
        : `${here}. The cloud does not have all of it yet.`,
    behind: true,
  };
};

const emptyForm = {
  accountId: "",
  bucket: "",
  accessKeyId: "",
  secretAccessKey: "",
};

/**
 * A copy of the saved sounds in the cloud (Cloudflare R2): send what the
 * cloud does not have yet, or fetch what this computer does not have.
 */
export const CloudBackupModal = ({ open, onClose }: CloudBackupModalProps) => {
  const [settings, setSettings] = useState<ICloudSettings | null>(null);
  const [form, setForm] = useState(emptyForm);
  // true while the bucket and the key are being filled in
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState<ICloudBackupState | null>(null);
  const [looking, setLooking] = useState(false);
  const [progress, setProgress] = useState<ICloudProgress | null>(null);
  const [soundsProgress, setSoundsProgress] = useState<ISoundsProgress | null>(
    null
  );
  const [busy, setBusy] = useState<"backup" | "get" | null>(null);
  const [backupResult, setBackupResult] = useState<ISwarmBackupResult | null>(
    null
  );
  const [stopping, setStopping] = useState(false);
  const [message, setMessage] = useState("");
  // a backup key: the one that waits for its passphrase, and the passphrase
  // of a key that is saved for someone else
  const [keyWaits, setKeyWaits] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [sharePassphrase, setSharePassphrase] = useState("");
  // true while the details of Cloudflare are typed by hand
  const [byHand, setByHand] = useState(false);

  const look = useCallback(async () => {
    setLooking(true);
    try {
      setState(await window.kweenb.methods.getCloudBackupState());
    } catch (e) {
      setState({
        configured: true,
        message: "Something went wrong. Try again.",
      });
    }
    setLooking(false);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    let closed = false;
    setState(null);
    setProgress(null);
    setSoundsProgress(null);
    setBackupResult(null);
    setBusy(null);
    setStopping(false);
    setMessage("");
    setEditing(false);
    setKeyWaits(false);
    setPassphrase("");
    setSharePassphrase("");
    setByHand(false);
    window.kweenb.methods.getCloudSettings().then((cloudSettings) => {
      if (closed) return;
      setSettings(cloudSettings);
      setForm({ ...emptyForm, ...cloudSettings, secretAccessKey: "" });
      look();
    });
    const removeListener = window.kweenb.events.onCloudProgress(
      (event, cloudProgress) => {
        if (!closed) setProgress(cloudProgress);
      }
    );
    const removeSoundsListener = window.kweenb.events.onSoundsProgress(
      (event, progressOfSounds) => {
        if (!closed) setSoundsProgress(progressOfSounds);
      }
    );
    return () => {
      closed = true;
      removeListener();
      removeSoundsListener();
    };
  }, [open, look]);

  const save = async () => {
    setMessage("");
    const saved = await window.kweenb.methods.saveCloudSettings(form);
    setSettings(saved);
    if (saved.message) {
      setMessage(saved.message);
      return;
    }
    setForm({ ...form, secretAccessKey: "" });
    setEditing(false);
    look();
  };

  /**
   * A key was activated: from now on its bucket is used
   */
  const keyActivated = async () => {
    setKeyWaits(false);
    setPassphrase("");
    setEditing(false);
    setMessage("The backup key is installed.");
    const cloudSettings = await window.kweenb.methods.getCloudSettings();
    setSettings(cloudSettings);
    setForm({ ...emptyForm, ...cloudSettings, secretAccessKey: "" });
    look();
  };

  const chooseKey = async () => {
    setMessage("");
    const chosen = await window.kweenb.methods.chooseBackupKey();
    if (!chosen) return;
    if (chosen.done) await keyActivated();
    else if (chosen.needsPassphrase) setKeyWaits(true);
    if (chosen.message) setMessage(chosen.message);
  };

  const activateKey = async () => {
    setMessage("");
    const activated = await window.kweenb.methods.activateBackupKey(passphrase);
    if (activated.done) await keyActivated();
    else setMessage(activated.message || "The backup key was not activated.");
  };

  const shareKey = async () => {
    setMessage("");
    const saved = await window.kweenb.methods.saveBackupKey(sharePassphrase);
    if (saved.done)
      setMessage(
        sharePassphrase
          ? "The backup key is saved. Give the file to who needs it, and tell them the passphrase another way (not together with the file)."
          : "The backup key is saved. Anyone who has this file can read and change the backups: only give it to people you trust."
      );
    else if (saved.message) setMessage(saved.message);
  };

  /**
   * Read the sounds from the bees, then bring the cloud up to date
   */
  const backUp = async () => {
    setBusy("backup");
    setProgress(null);
    setSoundsProgress(null);
    setBackupResult(null);
    setStopping(false);
    setMessage("");
    try {
      setBackupResult(await window.kweenb.methods.backUpSwarmToCloud());
    } catch (e) {
      setMessage("Something went wrong. Try again.");
    }
    setBusy(null);
    look();
  };

  /**
   * Fetch what this computer does not have, or send what the cloud does
   * not have (without reading the bees)
   */
  const getFromCloud = async (send: boolean = false) => {
    setBusy(send ? "backup" : "get");
    setProgress(null);
    setBackupResult(null);
    setStopping(false);
    setMessage("");
    try {
      const result = await (send
        ? window.kweenb.methods.sendSoundsToCloud()
        : window.kweenb.methods.getSoundsFromCloud());
      if (result.message) setMessage(result.message);
      else if (result.cancelled)
        setMessage("Stopped. What was not done yet is done the next time.");
      else
        setMessage(
          send
            ? "The cloud is up to date with the backup on this computer."
            : `${filesInWords(result.files)} fetched from the cloud.`
        );
    } catch (e) {
      setMessage("Something went wrong. Try again.");
    }
    setBusy(null);
    look();
  };

  const field = (
    name: keyof typeof emptyForm,
    label: string,
    placeholder: string,
    secret: boolean = false
  ) => (
    <Box>
      <label htmlFor={`cloud-${name}`}>{label}</label>
      <input
        id={`cloud-${name}`}
        type={secret ? "password" : "text"}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={form[name]}
        onChange={(event) => setForm({ ...form, [name]: event.target.value })}
        style={{ width: "100%", boxSizing: "border-box" }}
      />
    </Box>
  );

  const showForm = editing || (state !== null && !state.configured);
  const toSend = state?.toSend;
  const toGet = state?.toGet;
  // without a bee that is switched on there is nothing to read
  const noBees = (state?.beesOnline || 0) === 0;

  return (
    <BaseModal
      title={
        state && !state.configured
          ? "Install a backup key"
          : "Back up to the cloud"
      }
      disableBackdropClick
      showCloseButton={false}
      open={open}
      onClose={onClose}
    >
      <Box display={"flex"} flexDirection={"column"} gap={1.5}>
        {showForm && (
          <>
            {!settings?.hasSecret && (
              <Typography variant="small">
                KweenB keeps a copy of the sounds of the swarm in the cloud. To
                use it you need a backup key: a file you get from whoever looks
                after the backups.
              </Typography>
            )}
            {settings?.hasSecret && (
              <Typography variant="small">
                {`A backup key is installed: KweenB uses the bucket "${settings.bucket}".`}
              </Typography>
            )}
            <Box display={"flex"} alignItems={"center"} gap={1.5}>
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
                buttonUse={ButtonUse.Normal}
                onClick={chooseKey}
              >
                {settings?.hasSecret
                  ? "Install another key…"
                  : "Choose a backup key…"}
              </Button>
            </Box>
            {keyWaits && (
              <Box display={"flex"} alignItems={"flex-end"} gap={1.5}>
                <Box flex={1}>
                  <label htmlFor="cloud-passphrase">
                    The passphrase of this key
                  </label>
                  <input
                    id="cloud-passphrase"
                    type="password"
                    autoComplete="off"
                    value={passphrase}
                    onChange={(event) => setPassphrase(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") activateKey();
                    }}
                    style={{ width: "100%", boxSizing: "border-box" }}
                  />
                </Box>
                <Button
                  buttonSize={ButtonSize.Small}
                  buttonType={ButtonType.Primary}
                  buttonUse={ButtonUse.Normal}
                  onClick={activateKey}
                >
                  Activate
                </Button>
              </Box>
            )}

            {settings?.hasSecret && (
              <Box
                display={"flex"}
                flexDirection={"column"}
                gap={1}
                pt={1.5}
                style={{ borderTop: "1px solid var(--grey-300)" }}
              >
                <Typography variant="small">
                  Give this backup to another computer or to someone else: save
                  its key as a file.
                </Typography>
                <Box display={"flex"} alignItems={"flex-end"} gap={1.5}>
                  <Box flex={1}>
                    <label htmlFor="cloud-share-passphrase">
                      Passphrase for the file (advised)
                    </label>
                    <input
                      id="cloud-share-passphrase"
                      type="password"
                      autoComplete="off"
                      placeholder="empty: anyone with the file can use it"
                      value={sharePassphrase}
                      onChange={(event) =>
                        setSharePassphrase(event.target.value)
                      }
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </Box>
                  <Button
                    buttonSize={ButtonSize.Small}
                    buttonType={ButtonType.Secondary}
                    buttonUse={ButtonUse.Dark}
                    onClick={shareKey}
                  >
                    Save a backup key…
                  </Button>
                </Box>
              </Box>
            )}

            <Box
              display={"flex"}
              flexDirection={"column"}
              gap={1}
              pt={1.5}
              style={{ borderTop: "1px solid var(--grey-300)" }}
            >
              <Typography
                variant="small"
                style={{ cursor: "pointer", opacity: 0.8 }}
                onClick={() => setByHand(!byHand)}
              >
                {byHand ? "▾" : "▸"} Fill in the details of Cloudflare by hand
                (to make the first key)
              </Typography>
              {byHand && (
                <>
                  <Typography variant="extraSmall">
                    In Cloudflare, make an R2 bucket and an R2 API token that
                    may read and write objects in it. It shows an access key id
                    and a secret access key.
                  </Typography>
                  {field(
                    "accountId",
                    "Account id",
                    "the first part of the bucket's address"
                  )}
                  {field("bucket", "Bucket", "e.g. zwerm-sounds")}
                  {field("accessKeyId", "Access key id", "")}
                  {field(
                    "secretAccessKey",
                    "Secret access key",
                    settings?.hasSecret
                      ? "leave empty to keep the one that is installed"
                      : "",
                    true
                  )}
                  <Box>
                    <Button
                      buttonSize={ButtonSize.Small}
                      buttonType={ButtonType.Secondary}
                      buttonUse={ButtonUse.Dark}
                      onClick={save}
                    >
                      Save these details
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </>
        )}

        {!showForm && busy && (
          <>
            <Typography variant="small">
              {stopping && "Stopping…"}
              {!stopping &&
                !progress &&
                busy === "backup" &&
                !soundsProgress &&
                "Looking at the sounds on the bees…"}
              {!stopping &&
                !progress &&
                busy === "backup" &&
                soundsProgress &&
                `Reading the sounds of ${beeNameInWords(
                  soundsProgress.name
                )} (${soundsProgress.current} of ${soundsProgress.total})…`}
              {!stopping &&
                !progress &&
                busy === "get" &&
                "Comparing this computer with the cloud…"}
              {!stopping &&
                progress &&
                `${busy === "backup" ? "Sending" : "Fetching"} file ${
                  progress.current
                } of ${progress.total} (${sizeInWords(
                  progress.doneBytes
                )} of ${sizeInWords(progress.totalBytes)})…`}
            </Typography>
            <LinearProgress
              variant={
                !stopping && (progress || soundsProgress)
                  ? "determinate"
                  : "indeterminate"
              }
              value={
                progress && progress.totalBytes > 0
                  ? (progress.doneBytes / progress.totalBytes) * 100
                  : soundsProgress && soundsProgress.total > 0
                  ? (soundsProgress.current / soundsProgress.total) * 100
                  : 0
              }
            />
          </>
        )}

        {!showForm && !busy && (
          <>
            {(looking || state === null) && (
              <Typography variant="small">
                Comparing this computer with the cloud…
              </Typography>
            )}
            {!looking && state?.message && (
              <Typography style={{ color: "var(--red-status)" }}>
                {state.message}
              </Typography>
            )}
            {backupResult && (
              <Box display={"flex"} flexDirection={"column"} gap={0.5}>
                {backupResult.cancelled && (
                  <Typography>
                    Stopped. What was not done yet is done the next time.
                  </Typography>
                )}
                {!backupResult.cancelled && !backupResult.cloudMessage && (
                  <Typography>
                    {backupResult.saved.length > 0
                      ? `The cloud now has the sounds of ${
                          backupResult.saved.length === 1
                            ? beeNameInWords(backupResult.saved[0].name)
                            : `${backupResult.saved.length} bees`
                        } as they are on the swarm right now.`
                      : "The cloud is up to date with what was saved on this computer."}
                  </Typography>
                )}
                {backupResult.swarmMessage && (
                  <Typography variant="small">
                    {backupResult.swarmMessage}
                  </Typography>
                )}
                {backupResult.cloudMessage && (
                  <Typography style={{ color: "var(--red-status)" }}>
                    {backupResult.saved.length > 0
                      ? `The sounds were read from the bees and are on this computer, but they did not go to the cloud. ${backupResult.cloudMessage} Open this again when this computer has internet.`
                      : backupResult.cloudMessage}
                  </Typography>
                )}
                {backupResult.notSaved.map(({ name, message: reason }) => (
                  <Typography
                    key={name}
                    variant="small"
                    style={{ color: "var(--orange-status)" }}
                  >
                    {`${beeNameInWords(
                      name
                    )} was not read: ${reason} Its copy in the cloud stays as it was.`}
                  </Typography>
                ))}
              </Box>
            )}
            {!looking && toSend && toGet && (
              <>
                {!backupResult && noBees && (
                  <Typography>
                    No bee is switched on right now. Switch on the bees you want
                    to back up and try again.
                  </Typography>
                )}
                {!backupResult && noBees && toSend.files > 0 && (
                  <Typography
                    variant="small"
                    style={{ color: "var(--orange-status)" }}
                  >
                    {`The backup on this computer did not all reach the cloud yet (${filesInWords(
                      toSend.files
                    )}, ${sizeInWords(toSend.bytes)}). You can send it now.`}
                  </Typography>
                )}
                {!backupResult && !noBees && (
                  <Typography>
                    {`Back up ${
                      state?.beesOnline === 1
                        ? "the bee that is"
                        : `the ${state?.beesOnline} bees that are`
                    } switched on?`}
                  </Typography>
                )}
                {!backupResult && !noBees && (
                  <Typography variant="small">
                    Their sounds are read and the cloud is brought up to date,
                    so the cloud holds what they have right now. This computer
                    has to reach the bees and the internet at the same time.
                  </Typography>
                )}
                {(state?.bees || []).length > 0 && (
                  <Box>
                    {(state?.bees || []).map((bee) => {
                      const { text, behind } = beeInWords(bee);
                      return (
                        <Typography
                          key={bee.name}
                          variant="small"
                          display="block"
                          style={
                            behind
                              ? { color: "var(--orange-status)" }
                              : undefined
                          }
                        >
                          {text}
                        </Typography>
                      );
                    })}
                  </Box>
                )}
                {toGet.files > 0 && (
                  <Typography variant="small">
                    {`${filesInWords(toGet.files)} (${sizeInWords(
                      toGet.bytes
                    )}) in the cloud ${
                      toGet.files === 1 ? "is" : "are"
                    } not on this computer.`}
                  </Typography>
                )}
                <Typography variant="extraSmall">
                  A sound that was taken off a bee stays in the bucket, but is
                  no longer part of that bee. To put the backup on bees, use
                  File → Restore.
                </Typography>
              </>
            )}
          </>
        )}

        {message && <Typography variant="small">{message}</Typography>}
      </Box>

      <ConfirmModalFooter>
        {showForm && (
          <>
            {state?.configured && (
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.TertiaryWhite}
                buttonUse={ButtonUse.Dark}
                onClick={() => {
                  setMessage("");
                  setEditing(false);
                }}
              >
                Back
              </Button>
            )}
            <Button
              buttonSize={ButtonSize.Small}
              buttonType={ButtonType.TertiaryWhite}
              buttonUse={ButtonUse.Dark}
              onClick={onClose}
            >
              Close
            </Button>
          </>
        )}
        {!showForm && busy && (
          <Button
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.TertiaryWhite}
            buttonUse={ButtonUse.Dark}
            disabled={stopping}
            onClick={() => {
              setStopping(true);
              window.kweenb.actions.cancelCloud();
            }}
          >
            Stop
          </Button>
        )}
        {!showForm && !busy && (
          <>
            <Button
              buttonSize={ButtonSize.Small}
              buttonType={ButtonType.TertiaryWhite}
              buttonUse={ButtonUse.Dark}
              onClick={() => {
                setMessage("");
                setEditing(true);
              }}
            >
              Backup key…
            </Button>
            <Button
              buttonSize={ButtonSize.Small}
              buttonType={ButtonType.TertiaryWhite}
              buttonUse={ButtonUse.Dark}
              onClick={onClose}
            >
              Close
            </Button>
            {toGet && toGet.files > 0 && (
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Secondary}
                buttonUse={ButtonUse.Dark}
                onClick={() => getFromCloud()}
              >
                Get from the cloud
              </Button>
            )}
            {state?.configured && !state.message && !noBees && (
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
                buttonUse={ButtonUse.Normal}
                onClick={backUp}
              >
                Back up
              </Button>
            )}
            {state?.configured && noBees && toSend && toSend.files > 0 && (
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
                buttonUse={ButtonUse.Normal}
                onClick={() => getFromCloud(true)}
              >
                Send to the cloud
              </Button>
            )}
          </>
        )}
      </ConfirmModalFooter>
    </BaseModal>
  );
};
