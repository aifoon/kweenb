/**
 * A copy of the saved sounds in the cloud (Cloudflare R2)
 */

import { Menu, app, dialog, safeStorage } from "electron";
import fs from "fs";
import {
  IBackupKeyResult,
  ICloudBackupState,
  ICloudProgress,
  ICloudSettings,
  ICloudSettingsInput,
  ICloudTransferResult,
  IRestoreSoundsResult,
  ISoundBackup,
  ISwarmBackupResult,
} from "@shared/interfaces";
import { KweenBGlobal } from "../kweenb";
import Setting from "../models/Setting";
import SettingHelpers from "../lib/KweenB/SettingHelpers";
import {
  fetchBeeForRestore,
  getCloudState,
  getFromCloud,
  sendToCloud,
} from "../lib/CloudBackup/CloudBackup";
import {
  BACKUP_KEY_EXTENSION,
  BackupKeyError,
  createBackupKey,
  describeBackupKey,
  openBackupKey,
} from "../lib/CloudBackup/BackupKey";
import { CloudPlan } from "../lib/CloudBackup/CloudPlan";
import { cancelSounds, restoreSounds, saveSounds } from "./speaker";
import {
  R2Error,
  R2Operation,
  R2Settings,
  whyRefused,
} from "../lib/CloudBackup/R2Client";

const KEYS = {
  accountId: "kweenbCloudAccountId",
  bucket: "kweenbCloudBucket",
  accessKeyId: "kweenbCloudAccessKeyId",
  // the secret, encrypted with the keychain of this computer
  secret: "kweenbCloudSecret",
};

const BUSY_MESSAGE =
  "KweenB is still busy with the cloud. Wait until that is finished and try again.";

// one thing with the cloud at a time
let currentOperation: R2Operation | null = null;

const read = async (key: string): Promise<string> =>
  String((await Setting.findOne({ where: { key } }))?.value || "");

/**
 * The secret is kept encrypted: only this user on this computer can read it
 */
const readSecret = async (): Promise<string> => {
  const stored = await read(KEYS.secret);
  if (!stored) return "";
  try {
    return safeStorage.decryptString(Buffer.from(stored, "base64"));
  } catch (e) {
    // encrypted on another computer or by another user: ask for it again
    return "";
  }
};

export const readCloudSettings = async (): Promise<R2Settings | null> => {
  const settings = {
    accountId: (await read(KEYS.accountId)).trim(),
    bucket: (await read(KEYS.bucket)).trim(),
    accessKeyId: (await read(KEYS.accessKeyId)).trim(),
    secretAccessKey: await readSecret(),
  };
  return Object.values(settings).every((value) => value !== "")
    ? settings
    : null;
};

/**
 * The File menu: backing up to and restoring from the cloud can be chosen
 * when a backup key is installed; as long as there is none they are greyed
 * out and "Install a Backup Key…" shows
 */
export const showBackupMenu = async () => {
  const installed = (await readCloudSettings().catch(() => null)) !== null;
  const menu = Menu.getApplicationMenu();
  ["cloud-backup", "cloud-restore"].forEach((id) => {
    const item = menu?.getMenuItemById(id);
    if (item) item.enabled = installed;
  });
  const key = menu?.getMenuItemById("cloud-key");
  if (key) key.visible = !installed;
};

const inWords = (e: unknown): string =>
  e instanceof R2Error
    ? e.message
    : "Something went wrong with the cloud. Try again.";

const backupFolder = async (): Promise<string> =>
  (await SettingHelpers.getAllSettings()).kweenBSettings.backupFolder;

const summary = (plan: CloudPlan) => ({
  files: plan.transfer.length,
  bytes: plan.transferBytes,
});

/**
 * What is filled in for the cloud (never the secret itself)
 */
export const getCloudSettings = async (): Promise<ICloudSettings> => ({
  accountId: await read(KEYS.accountId),
  bucket: await read(KEYS.bucket),
  accessKeyId: await read(KEYS.accessKeyId),
  hasSecret: (await readSecret()) !== "",
});

/**
 * Remember the bucket and the key. An empty secret keeps the one that was
 * filled in before.
 */
export const saveCloudSettings = async (
  event: Electron.IpcMainInvokeEvent,
  input: ICloudSettingsInput
): Promise<ICloudSettings & { message?: string }> => {
  // an account id and a bucket are plain names: nothing else gets in
  const clean = (value: unknown) => String(value || "").trim();
  const accountId = clean(input?.accountId);
  const bucket = clean(input?.bucket);
  const accessKeyId = clean(input?.accessKeyId);
  const secret = clean(input?.secretAccessKey);

  const fail = async (message: string) => ({
    ...(await getCloudSettings()),
    message,
  });
  // a bucket that has to stay in Europe has ".eu" behind the account id
  if (accountId && !/^[a-z0-9]+(\.(eu|fedramp))?$/i.test(accountId))
    return fail(
      "The account id holds only letters and digits. You find it in the address of the bucket: <account id>.r2.cloudflarestorage.com."
    );
  if (bucket && !/^[a-z0-9][a-z0-9.-]*$/.test(bucket))
    return fail(
      "The name of a bucket holds only lower case letters, digits and dashes."
    );
  // the keys of R2 have a fixed length: a hint that the wrong thing was
  // pasted (the lengths say nothing about the keys themselves)
  console.log(
    `Cloud settings: access key id of ${accessKeyId.length} characters, secret of ${secret.length} characters`
  );
  if (accessKeyId && accessKeyId.length !== 32)
    return fail(
      `An access key id of R2 has 32 characters; this one has ${accessKeyId.length}. In Cloudflare, an R2 API token shows three things: the token value, the access key id and the secret access key. KweenB needs the last two.`
    );
  if (secret && secret.length !== 64)
    return fail(
      `A secret access key of R2 has 64 characters; this one has ${secret.length}. In Cloudflare, an R2 API token shows three things: the token value, the access key id and the secret access key. KweenB needs the last two.`
    );
  if (secret && !safeStorage.isEncryptionAvailable())
    return fail(
      "This computer can not keep the secret safe, so it was not saved."
    );

  await SettingHelpers.updateSetting({ key: KEYS.accountId, value: accountId });
  await SettingHelpers.updateSetting({ key: KEYS.bucket, value: bucket });
  await SettingHelpers.updateSetting({
    key: KEYS.accessKeyId,
    value: accessKeyId,
  });
  if (secret)
    await SettingHelpers.updateSetting({
      key: KEYS.secret,
      value: safeStorage.encryptString(secret).toString("base64"),
    });
  await showBackupMenu();
  return getCloudSettings();
};

/**
 * Backup keys: a file that holds the details of the bucket, to give to
 * someone else or to another computer
 */

// the key file that was chosen and waits for its passphrase
let chosenKey: string | null = null;

const storeDetails = async (details: {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}) => {
  await SettingHelpers.updateSetting({
    key: KEYS.accountId,
    value: details.accountId,
  });
  await SettingHelpers.updateSetting({
    key: KEYS.bucket,
    value: details.bucket,
  });
  await SettingHelpers.updateSetting({
    key: KEYS.accessKeyId,
    value: details.accessKeyId,
  });
  await SettingHelpers.updateSetting({
    key: KEYS.secret,
    value: safeStorage
      .encryptString(details.secretAccessKey)
      .toString("base64"),
  });
};

/**
 * Activate the key that was chosen: from then on KweenB uses its bucket
 * @param passphrase The passphrase of an encrypted key
 */
export const activateBackupKey = async (
  event: Electron.IpcMainInvokeEvent | null,
  passphrase: string = ""
): Promise<IBackupKeyResult> => {
  if (!chosenKey) return { done: false, message: "Choose a backup key first." };
  if (!safeStorage.isEncryptionAvailable())
    return {
      done: false,
      message:
        "This computer can not keep the key safe, so it was not activated.",
    };
  try {
    const details = openBackupKey(chosenKey, String(passphrase || ""));
    await storeDetails(details);
    chosenKey = null;
    await showBackupMenu();
    return { done: true, bucket: details.bucket };
  } catch (e) {
    if (e instanceof BackupKeyError)
      return {
        done: false,
        needsPassphrase: e.needsPassphrase,
        message: e.message,
      };
    return { done: false, message: "The backup key could not be activated." };
  }
};

/**
 * Let the user choose a backup key. A key without a passphrase is
 * activated right away; one with a passphrase waits for it.
 */
export const chooseBackupKey = async (): Promise<IBackupKeyResult | null> => {
  const { canceled, filePaths } = await dialog.showOpenDialog(
    KweenBGlobal.kweenb.mainWindow,
    {
      title: "Choose a backup key",
      properties: ["openFile"],
      filters: [{ name: "Backup keys", extensions: [BACKUP_KEY_EXTENSION] }],
    }
  );
  if (canceled || filePaths.length === 0) return null;
  try {
    // a key is small: anything big is something else
    if ((await fs.promises.stat(filePaths[0])).size > 64 * 1024)
      throw new BackupKeyError(
        "This file is not a backup key of KweenB. Choose the file you were given (it ends in .kweenbkey)."
      );
    const contents = await fs.promises.readFile(filePaths[0], "utf8");
    const { bucket, needsPassphrase } = describeBackupKey(contents);
    chosenKey = contents;
    if (needsPassphrase) return { done: false, needsPassphrase: true, bucket };
    return await activateBackupKey(null);
  } catch (e) {
    chosenKey = null;
    return {
      done: false,
      message:
        e instanceof BackupKeyError
          ? e.message
          : "The file could not be read. Try again.",
    };
  }
};

/**
 * Save the bucket and the key KweenB uses now as a backup key file
 * @param passphrase Encrypts the file; empty leaves it readable for anyone
 */
export const saveBackupKey = async (
  event: Electron.IpcMainInvokeEvent,
  passphrase: string = ""
): Promise<IBackupKeyResult> => {
  const settings = await readCloudSettings();
  if (!settings)
    return { done: false, message: "Fill in the bucket and the key first." };
  const { canceled, filePath } = await dialog.showSaveDialog(
    KweenBGlobal.kweenb.mainWindow,
    {
      title: "Save a backup key",
      defaultPath: `${settings.bucket}.${BACKUP_KEY_EXTENSION}`,
      filters: [{ name: "Backup keys", extensions: [BACKUP_KEY_EXTENSION] }],
    }
  );
  if (canceled || !filePath) return { done: false };
  try {
    // only the owner of the file can read it on this computer
    await fs.promises.writeFile(
      filePath,
      createBackupKey(settings, String(passphrase || "")),
      { encoding: "utf8", mode: 0o600 }
    );
    return { done: true, bucket: settings.bucket };
  } catch (e) {
    return { done: false, message: "The backup key could not be saved there." };
  }
};

/**
 * Compare the saved sounds on this computer with the cloud
 */
export const getCloudBackupState = async (): Promise<ICloudBackupState> => {
  const settings = await readCloudSettings();
  if (!settings) return { configured: false };
  if (currentOperation) return { configured: true, message: BUSY_MESSAGE };
  try {
    const state = await getCloudState(settings, await backupFolder());
    const date = (when: Date | null) => (when ? when.toISOString() : null);
    return {
      configured: true,
      beesOnline: KweenBGlobal.kweenb.beeStates.getBeesWithOnlineState().length,
      toSend: summary(state.upload),
      toGet: summary(state.download),
      bees: state.bees.map((bee) => ({
        ...bee,
        hereSavedAt: date(bee.hereSavedAt),
        cloudSavedAt: date(bee.cloudSavedAt),
      })),
    };
  } catch (e) {
    console.error(
      `Cloud backup: bucket "${settings.bucket}", account id of ${settings.accountId.length} characters`
    );
    // refused although the key is known: look for the usual reasons
    const found =
      e instanceof R2Error && e.status === 403
        ? await whyRefused(settings).catch(() => null)
        : null;
    // a bucket that is kept in Europe only needs another address: KweenB
    // fills that in itself and looks again
    if (found?.accountId && found.accountId !== settings.accountId) {
      await SettingHelpers.updateSetting({
        key: KEYS.accountId,
        value: found.accountId,
      });
      return getCloudBackupState();
    }
    return { configured: true, message: found?.message || inWords(e) };
  }
};

const sendProgress = (progress: ICloudProgress) => {
  const { mainWindow } = KweenBGlobal.kweenb;
  if (!mainWindow.isDestroyed())
    mainWindow.webContents.send("cloud-progress", progress);
};

const transfer = async (
  direction: "send" | "get"
): Promise<ICloudTransferResult> => {
  const result = { files: 0, cancelled: false };
  const settings = await readCloudSettings();
  if (!settings)
    return { ...result, message: "Fill in the bucket and the key first." };
  if (currentOperation) return { ...result, message: BUSY_MESSAGE };
  const operation: R2Operation = { cancelled: false };
  currentOperation = operation;
  try {
    const folder = await backupFolder();
    // looked at again right before: what is sent is what is there now
    const state = await getCloudState(settings, folder, operation);
    const done = await (direction === "send" ? sendToCloud : getFromCloud)(
      settings,
      folder,
      state,
      operation,
      (progress) => sendProgress({ direction, ...progress })
    );
    return done;
  } catch (e) {
    return operation.cancelled
      ? { ...result, cancelled: true }
      : { ...result, message: inWords(e) };
  } finally {
    currentOperation = null;
  }
};

/**
 * Back up the swarm: read the sounds from every bee that is switched on,
 * then bring the cloud up to date. So the cloud holds what the bees have
 * now, not what happened to be saved on this computer earlier.
 */
export const backUpSwarm = async (
  event: Electron.IpcMainInvokeEvent
): Promise<ISwarmBackupResult> => {
  const result: ISwarmBackupResult = {
    saved: [],
    notSaved: [],
    sentFiles: 0,
    cancelled: false,
  };
  if (!(await readCloudSettings()))
    return { ...result, cloudMessage: "Fill in the bucket and the key first." };

  // 1. from the bees to this computer (only new and changed sounds)
  const saved = await saveSounds(event, undefined);
  result.saved = saved.saved;
  result.notSaved = saved.failed;
  result.swarmMessage = saved.message;
  if (saved.cancelled) return { ...result, cancelled: true };

  // 2. from this computer to the cloud
  const sent = await transfer("send");
  return {
    ...result,
    sentFiles: sent.files,
    cancelled: sent.cancelled,
    cloudMessage: sent.message,
  };
};

/**
 * Send what is backed up on this computer and did not reach the cloud yet,
 * without reading the bees (for when no bee is switched on)
 */
export const sendSoundsToCloud = (): Promise<ICloudTransferResult> =>
  transfer("send");

/**
 * Fetch the saved sounds this computer does not have yet
 */
export const getSoundsFromCloud = (): Promise<ICloudTransferResult> =>
  transfer("get");

/**
 * The sounds of the bees as the cloud has them, to restore bees from.
 * Empty when there is no backup key or the cloud can not be reached.
 */
export const getCloudSoundSets = async (): Promise<ISoundBackup[]> => {
  const settings = await readCloudSettings();
  if (!settings || currentOperation) return [];
  try {
    const state = await getCloudState(settings, await backupFolder());
    return state.bees
      .filter((bee) => bee.inCloud > 0)
      .map((bee) => ({
        source: "cloud" as const,
        name: bee.name,
        date: (bee.cloudSavedAt || new Date(0)).toISOString(),
        sounds: bee.inCloud,
        sizeBytes: 0,
      }));
  } catch (e) {
    return [];
  }
};

/**
 * Fetch the backup of one bee from the cloud, to put it on a speaker
 * @param backupName The bee the backup is of (bee07)
 * @returns The folder to restore from, or why there is none
 */
export const fetchBackupOfBee = async (
  backupName: string
): Promise<{ folder?: string; message?: string; cancelled?: boolean }> => {
  const settings = await readCloudSettings();
  if (!settings) return { message: "Install a backup key first." };
  if (currentOperation) return { message: BUSY_MESSAGE };
  const operation: R2Operation = { cancelled: false };
  currentOperation = operation;
  try {
    return {
      folder: await fetchBeeForRestore(
        settings,
        await backupFolder(),
        String(backupName),
        operation,
        (progress) => sendProgress({ direction: "get", ...progress })
      ),
    };
  } catch (e) {
    return operation.cancelled
      ? { message: "Stopped. Nothing was changed on the bee.", cancelled: true }
      : { message: inWords(e) };
  } finally {
    currentOperation = null;
  }
};

/**
 * Restore a bee from the cloud in one go: fetch what is missing of the
 * backup, then put it on the bee.
 * @param beeId The bee that gets the sounds
 * @param backupName The bee the backup is of (bee07)
 * @param exact Also take the sounds off the bee that are not in the backup
 */
export const restoreSoundsFromCloud = async (
  event: Electron.IpcMainInvokeEvent,
  beeId: number,
  backupName: string,
  exact: boolean
): Promise<IRestoreSoundsResult> => {
  const fetched = await fetchBackupOfBee(backupName);
  if (!fetched.folder)
    return {
      success: false,
      sounds: 0,
      cancelled: fetched.cancelled === true,
      message: fetched.message,
    };
  return restoreSounds(
    event,
    beeId,
    String(backupName),
    exact === true,
    fetched.folder
  );
};

/**
 * Stop sending or fetching
 */
export const cancelCloud = () => {
  // backing up the swarm starts with reading the bees
  cancelSounds();
  if (!currentOperation) return;
  currentOperation.cancelled = true;
  try {
    if (currentOperation.abort) currentOperation.abort();
  } catch (e) {
    // Ignore errors when stopping
  }
};

// nothing keeps running when KweenB closes
app.on("before-quit", cancelCloud);
