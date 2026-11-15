/**
 * A backup key: a file that holds what KweenB needs to reach the bucket
 * with the backups. It can be given to someone else and activated on any
 * computer, so nobody has to type (or mail) the details of Cloudflare.
 *
 * Whoever has the file can read and change the backups. With a passphrase
 * the file is encrypted and useless without it.
 *
 * Nothing in here needs Electron, so it can be tested on its own.
 */

import crypto from "crypto";
import { R2Settings } from "./R2Client";

export const BACKUP_KEY_EXTENSION = "kweenbkey";

// what marks a file as a backup key, and its version
const MARK = "kweenb-backup-key";
const VERSION = 1;

/**
 * Why a backup key could not be used. The message is meant for the user.
 */
export class BackupKeyError extends Error {
  // true when the key only needs its (right) passphrase
  public needsPassphrase: boolean;

  constructor(message: string, needsPassphrase: boolean = false) {
    super(message);
    this.name = "BackupKeyError";
    this.needsPassphrase = needsPassphrase;
  }
}

type KeyDetails = Pick<
  R2Settings,
  "accountId" | "bucket" | "accessKeyId" | "secretAccessKey"
>;

// turning a passphrase into a key is made slow on purpose: guessing
// passphrases takes ages
const keyFrom = (passphrase: string, salt: Buffer): Buffer =>
  crypto.scryptSync(passphrase.normalize("NFKC"), salt, 32, {
    N: 2 ** 15,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

/**
 * Make the contents of a backup key file
 * @param passphrase Encrypts the key; empty leaves it readable for anyone
 */
export const createBackupKey = (
  details: KeyDetails,
  passphrase: string = ""
): string => {
  const secrets = JSON.stringify({
    accountId: details.accountId,
    bucket: details.bucket,
    accessKeyId: details.accessKeyId,
    secretAccessKey: details.secretAccessKey,
  });
  // what the file is for can be read without the passphrase
  const file: Record<string, unknown> = {
    type: MARK,
    version: VERSION,
    bucket: details.bucket,
    created: new Date().toISOString(),
  };
  if (passphrase) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      keyFrom(passphrase, salt),
      iv
    );
    const data = Buffer.concat([
      cipher.update(secrets, "utf8"),
      cipher.final(),
    ]);
    file.encrypted = {
      salt: salt.toString("base64"),
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      data: data.toString("base64"),
    };
  } else file.key = JSON.parse(secrets);
  return `${JSON.stringify(file, null, 2)}\n`;
};

const NOT_A_KEY =
  "This file is not a backup key of KweenB. Choose the file you were given (it ends in .kweenbkey).";

const parse = (contents: string): Record<string, any> => {
  let file: Record<string, any>;
  try {
    file = JSON.parse(contents);
  } catch (e) {
    throw new BackupKeyError(NOT_A_KEY);
  }
  if (!file || file.type !== MARK) throw new BackupKeyError(NOT_A_KEY);
  if (Number(file.version) > VERSION)
    throw new BackupKeyError(
      "This backup key was made by a newer KweenB. Update KweenB and try again."
    );
  return file;
};

/**
 * Look at a backup key without opening it
 */
export const describeBackupKey = (
  contents: string
): { bucket: string; needsPassphrase: boolean } => {
  const file = parse(contents);
  return {
    bucket: typeof file.bucket === "string" ? file.bucket : "",
    needsPassphrase: !!file.encrypted,
  };
};

/**
 * Open a backup key
 * @param passphrase The passphrase of an encrypted key
 */
export const openBackupKey = (
  contents: string,
  passphrase: string = ""
): KeyDetails => {
  const file = parse(contents);
  let details: any = file.key;
  if (file.encrypted) {
    if (!passphrase)
      throw new BackupKeyError("This backup key needs its passphrase.", true);
    try {
      const { salt, iv, tag, data } = file.encrypted;
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        keyFrom(passphrase, Buffer.from(salt, "base64")),
        Buffer.from(iv, "base64")
      );
      decipher.setAuthTag(Buffer.from(tag, "base64"));
      details = JSON.parse(
        Buffer.concat([
          decipher.update(Buffer.from(data, "base64")),
          decipher.final(),
        ]).toString("utf8")
      );
    } catch (e) {
      throw new BackupKeyError(
        "That is not the passphrase of this backup key. Try again.",
        true
      );
    }
  }
  const text = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const opened = {
    accountId: text(details?.accountId),
    bucket: text(details?.bucket),
    accessKeyId: text(details?.accessKeyId),
    secretAccessKey: text(details?.secretAccessKey),
  };
  if (Object.values(opened).some((value) => value === ""))
    throw new BackupKeyError(
      "This backup key is not complete. Ask for a new one."
    );
  return opened;
};
