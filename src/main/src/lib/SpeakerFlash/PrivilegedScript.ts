/**
 * The one script that runs with administrator rights while a speaker is
 * flashed: it takes the image from a pipe, writes it to the storage of the
 * speaker, reads it back and leaves what it found in a file.
 *
 * Nothing in here needs Electron (or runs anything), so it can be tested on
 * its own. For tests the script can write to an ordinary file instead.
 */

import path from "path";
import { isWholeDiskId } from "./DiskSelection";

// the files KweenB and the script share, inside a private folder
export const PIPE_FILE = "image.pipe";
export const BYTES_FILE = "bytes";
export const RESULT_FILE = "result";

export type WriteTarget =
  // the storage of a speaker, with the size it had when it was chosen
  | { kind: "disk"; diskId: string; sizeBytes: number }
  // an ordinary file (tests only)
  | { kind: "file"; path: string };

// what the script leaves in the result file
export type WriteScriptResult =
  | { outcome: "ok"; sha256: string }
  // changed: the disk is not what it was; unmount: it is in use;
  // write: writing failed; stopped: the image did not arrive completely
  | { outcome: "changed" | "unmount" | "write" | "stopped" }
  // the script did not get to leave a result
  | { outcome: "unknown" };

/**
 * Quote a text so the shell takes it literally
 */
export const quoteForShell = (text: string): string => {
  if (text.includes("\0")) throw new Error("A path cannot contain a null.");
  return `'${text.replace(/'/g, `'\\''`)}'`;
};

/**
 * Quote a text so AppleScript takes it literally
 */
export const quoteForAppleScript = (text: string): string =>
  `"${text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")}"`;

/**
 * The script that writes the image and reads it back
 * @param target Where the image is written
 * @param workDir The private folder with the pipe (see the file names above)
 */
export const buildWriteScript = (
  target: WriteTarget,
  workDir: string
): string => {
  if (!path.isAbsolute(workDir))
    throw new Error("The folder of the script has to be a full path.");

  const lines = [`DIR=${quoteForShell(workDir)}`];

  if (target.kind === "disk") {
    // checked right before use: only the name of a whole disk gets in here
    if (!isWholeDiskId(target.diskId))
      throw new Error(`"${target.diskId}" is not the name of a disk.`);
    if (!Number.isSafeInteger(target.sizeBytes) || target.sizeBytes <= 0)
      throw new Error("The size of the disk is not known.");

    const info = (key: string) =>
      `"$(/usr/sbin/diskutil info -plist "$DISK" | /usr/bin/plutil -extract ${key} raw -o - -)"`;

    lines.push(
      `DISK=${quoteForShell(target.diskId)}`,
      `TARGET="/dev/r$DISK"`,
      `EJECT=''`,
      `finish() { /bin/echo "$1" > "$DIR/${RESULT_FILE}"; if [ -n "$EJECT" ]; then /usr/sbin/diskutil eject "$DISK" > /dev/null 2>&1; fi; exit 0; }`,
      // the disk has to be the one that was chosen: same size, not a disk of this computer
      `[ ${info("TotalSize")} = ${quoteForShell(
        String(target.sizeBytes)
      )} ] || finish changed`,
      `[ ${info("Internal")} = 'false' ] || finish changed`,
      `/usr/sbin/diskutil unmountDisk "$DISK" > /dev/null 2>&1 || finish unmount`,
      `EJECT=1`
    );
  } else {
    if (!path.isAbsolute(target.path))
      throw new Error("The file to write has to be a full path.");
    lines.push(
      `TARGET=${quoteForShell(target.path)}`,
      `finish() { /bin/echo "$1" > "$DIR/${RESULT_FILE}"; exit 0; }`
    );
  }

  lines.push(
    // short reads from the pipe are gathered into full blocks
    `/bin/dd if="$DIR/${PIPE_FILE}" of="$TARGET" ibs=1m obs=4m 2> /dev/null || finish write`,
    `/bin/sync`,
    // KweenB tells how long the image was once all of it went into the pipe
    `[ -f "$DIR/${BYTES_FILE}" ] || finish stopped`,
    `BYTES="$(/bin/cat "$DIR/${BYTES_FILE}")"`,
    `case "$BYTES" in ''|*[!0-9]*) finish stopped ;; esac`,
    // read the same number of bytes back
    `HASH="$(/bin/dd if="$TARGET" bs=4m count=$(( (BYTES + 4194303) / 4194304 )) 2> /dev/null | /usr/bin/head -c "$BYTES" | /usr/bin/shasum -a 256 | /usr/bin/cut -c 1-64)"`,
    `finish "ok:$HASH"`
  );

  return lines.join("\n");
};

/**
 * The AppleScript that runs a script with administrator rights (the Mac
 * asks for the password)
 * @param script The shell script
 * @param prompt What the Mac shows above the password
 */
export const buildAdministratorAppleScript = (
  script: string,
  prompt: string
): string =>
  `do shell script ${quoteForAppleScript(
    script
  )} with prompt ${quoteForAppleScript(prompt)} with administrator privileges`;

/**
 * Read what the script left in its result file
 * @param content The content of the file, null when there is none
 */
export const parseWriteScriptResult = (
  content: string | null
): WriteScriptResult => {
  const result = (content || "").trim();
  const ok = /^ok:([0-9a-f]{64})$/.exec(result);
  if (ok) return { outcome: "ok", sha256: ok[1] };
  if (
    result === "changed" ||
    result === "unmount" ||
    result === "write" ||
    result === "stopped"
  )
    return { outcome: result };
  return { outcome: "unknown" };
};
