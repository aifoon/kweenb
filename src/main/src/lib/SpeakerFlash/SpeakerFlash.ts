/**
 * Flashing a speaker: open its storage over the USB cable, write an image to
 * it and check that the image arrived.
 *
 * Nothing in here needs Electron, so it can be run on its own. Writing to a
 * disk needs administrator rights; how the write script is run is handed in,
 * so a test can run it without those rights on an ordinary file.
 */

import { execFile, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import {
  DiskInfo,
  diskInfoOf,
  isStillTheSameDisk,
  isWholeDiskId,
  parsePlist,
  selectSpeakerStorage,
  wholeDiskIdsOf,
} from "./DiskSelection";
import { ImageError, feedImage, whyImageCannotBeUsed } from "./ImageFeeder";
import {
  BYTES_FILE,
  PIPE_FILE,
  RESULT_FILE,
  WriteTarget,
  buildAdministratorAppleScript,
  buildWriteScript,
  parseWriteScriptResult,
} from "./PrivilegedScript";

const DISKUTIL = "/usr/sbin/diskutil";

// how long the storage of a speaker gets to show up once the speaker was found
const STORAGE_TIMEOUT_MS = 30000;

// the pause between two looks at the disks
const STORAGE_POLL_MS = 1000;

// what the Mac shows above the password
const PASSWORD_PROMPT =
  "KweenB wants to erase the speaker and write the image to it.";

const TRY_CONNECTING_AGAIN =
  "Check that the jumper is set and that the USB cable goes straight into this computer. Then switch the speaker off and on, and try again.";

/**
 * Why flashing did not work. The message is meant for the user: what went
 * wrong and what to try.
 */
export class FlashError extends Error {
  // true when the user stopped it
  public cancelled: boolean;

  constructor(message: string, cancelled: boolean = false) {
    super(message);
    this.name = "FlashError";
    this.cancelled = cancelled;
  }
}

// lets the user stop what is going on
export interface FlashOperation {
  cancelled: boolean;
  abort?: () => void;
}

// a script that is running
export interface RunningScript {
  // how it ended: its exit code and what it said
  done: Promise<{ code: number | null; output: string }>;
  kill: () => void;
}

export type WriteStep = "password" | "writing" | "checking";

export interface WriteImageOptions {
  imagePath: string;
  target: WriteTarget;
  // runs the write script (with administrator rights when writing a disk)
  runScript: (script: string) => RunningScript;
  operation: FlashOperation;
  onProgress?: (step: WriteStep, percentage?: number) => void;
  // xz when it is not in its usual place (tests)
  xzPath?: string | null;
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Ask diskutil something (only ever to look, never to change)
 */
const askDiskutil = (args: string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    execFile(DISKUTIL, args, { maxBuffer: 16 * 1024 * 1024 }, (error, stdout) =>
      error ? reject(error) : resolve(stdout)
    );
  });

/**
 * Every whole disk of this computer
 */
export const listAllDiskIds = async (): Promise<string[]> =>
  wholeDiskIdsOf(parsePlist(await askDiskutil(["list", "-plist"])));

/**
 * What a disk is, null when it is not there (any more)
 * @param diskId e.g. disk4
 */
export const describeDisk = async (
  diskId: string
): Promise<DiskInfo | null> => {
  if (!isWholeDiskId(diskId)) return null;
  try {
    return diskInfoOf(
      parsePlist(await askDiskutil(["info", "-plist", diskId]))
    );
  } catch (e) {
    return null;
  }
};

/**
 * The external disks that are connected right now
 */
export const listExternalDisks = async (): Promise<DiskInfo[]> => {
  const diskIds = wholeDiskIdsOf(
    parsePlist(await askDiskutil(["list", "-plist", "external", "physical"]))
  );
  const disks = await Promise.all(diskIds.map(describeDisk));
  return disks.filter((disk): disk is DiskInfo => disk !== null);
};

/**
 * Did the tool that opens the storage find a speaker: it first says that it
 * is waiting, whatever follows is its talk with a speaker
 * @param output What the tool said so far
 */
export const talksWithSpeaker = (output: string): boolean => {
  const lines = output.split("\n").map((line) => line.trim());
  const waiting = lines.findIndex((line) => line.startsWith("Waiting for"));
  return (
    waiting >= 0 &&
    lines
      .slice(waiting + 1)
      .some((line) => line !== "" && !line.startsWith("Waiting for"))
  );
};

/**
 * Look for a speaker that is connected with a USB cable and open its
 * storage. Waits until a speaker shows up (or the user stops it).
 * @param usbbootFolder The folder with the tool that opens the storage
 * @param operation Lets the user stop looking
 * @param onFound Called when a speaker was found and its storage is opened
 * @returns The storage of the speaker
 */
export const openSpeakerStorage = async (
  usbbootFolder: string,
  operation: FlashOperation,
  onFound?: () => void
): Promise<DiskInfo> => {
  const tool = path.join(usbbootFolder, "rpiboot");
  const gadgetFolder = path.join(usbbootFolder, "mass-storage-gadget64");
  if (!fs.existsSync(tool) || !fs.existsSync(gadgetFolder))
    throw new FlashError(
      "This copy of KweenB misses the files it needs to flash a speaker. Install KweenB again."
    );

  // whatever is connected now is not the speaker
  let diskIdsBefore: string[];
  try {
    diskIdsBefore = await listAllDiskIds();
  } catch (e) {
    throw new FlashError(
      "KweenB could not look at the disks of this computer. Try again."
    );
  }
  if (operation.cancelled) throw new FlashError("Stopped.", true);

  // wait for the speaker and send it what it needs to show its storage
  let found = false;
  const tellFound = () => {
    if (found) return;
    found = true;
    if (onFound) onFound();
  };
  const exitCode = await new Promise<number | null>((resolve) => {
    const child = spawn(tool, ["-d", gadgetFolder], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    const listen = (chunk: Buffer) => {
      output = (output + chunk.toString()).slice(-4000);
      if (!operation.cancelled && talksWithSpeaker(output)) tellFound();
    };
    child.stdout.on("data", listen);
    child.stderr.on("data", listen);
    // eslint-disable-next-line no-param-reassign
    operation.abort = () => child.kill();
    child.on("error", () => resolve(null));
    child.on("close", (code) => {
      // eslint-disable-next-line no-param-reassign
      operation.abort = undefined;
      if (code !== 0 && !operation.cancelled)
        console.error(`Opening the storage of a speaker failed:\n${output}`);
      resolve(code);
    });
  });
  if (operation.cancelled) throw new FlashError("Stopped.", true);
  if (exitCode !== 0)
    throw new FlashError(
      `KweenB could not open the storage of the speaker. ${TRY_CONNECTING_AGAIN}`
    );
  tellFound();

  // the storage shows up as a new disk a few seconds later
  const deadline = Date.now() + STORAGE_TIMEOUT_MS;
  let seenBefore: string | null = null;
  while (Date.now() < deadline) {
    await sleep(STORAGE_POLL_MS);
    if (operation.cancelled) throw new FlashError("Stopped.", true);

    let selection;
    try {
      selection = selectSpeakerStorage(
        diskIdsBefore,
        await listExternalDisks()
      );
    } catch (e) {
      // look again in a moment
      continue;
    }

    // never guess which disk is the speaker
    if (!selection.disk && selection.reason === "several")
      throw new FlashError(
        "More than one new disk showed up, so KweenB cannot tell which one is the speaker. Unplug other USB disks and sticks. Then switch the speaker off and on, and try again."
      );

    // only a disk that is there twice in a row has settled
    if (selection.disk && selection.disk.id === seenBefore)
      return selection.disk;
    seenBefore = selection.disk ? selection.disk.id : null;
  }

  throw new FlashError(
    `The speaker was found, but its storage did not show up. ${TRY_CONNECTING_AGAIN}`
  );
};

/**
 * Run a script with administrator rights. The Mac asks for the password.
 * @param script The shell script
 */
export const runWithAdministratorRights = (script: string): RunningScript => {
  const child = spawn(
    "/usr/bin/osascript",
    ["-e", buildAdministratorAppleScript(script, PASSWORD_PROMPT)],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk.toString()));
  child.stderr.on("data", (chunk) => (output += chunk.toString()));
  return {
    done: new Promise((resolve) => {
      child.on("error", (e) => resolve({ code: null, output: e.message }));
      child.on("close", (code) => resolve({ code, output }));
    }),
    kill: () => child.kill(),
  };
};

/**
 * Write an image and check that it arrived
 * @param options
 */
export const writeImage = async (options: WriteImageOptions): Promise<void> => {
  const { imagePath, target, runScript, operation, onProgress, xzPath } =
    options;

  const problem =
    xzPath === undefined
      ? whyImageCannotBeUsed(imagePath)
      : whyImageCannotBeUsed(imagePath, xzPath);
  if (problem) throw new FlashError(problem);

  // a folder only this user can get into, with the pipe the image goes through
  const workDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "kweenb-flash-")
  );
  const pipePath = path.join(workDir, PIPE_FILE);

  try {
    await new Promise<void>((resolve, reject) => {
      execFile("/usr/bin/mkfifo", ["-m", "600", pipePath], (error) =>
        error ? reject(error) : resolve()
      );
    });
    if (operation.cancelled) throw new FlashError("Stopped.", true);

    if (onProgress) onProgress("password");
    const script = runScript(buildWriteScript(target, workDir));
    const feeder = feedImage({
      imagePath,
      pipePath,
      bytesPath: path.join(workDir, BYTES_FILE),
      xzPath,
      onOpen: () => onProgress && onProgress("writing", 0),
      onProgress: (percentage) =>
        onProgress && onProgress("writing", percentage),
    });

    // stopping: the script ends by itself when the pipe closes; as long as it
    // did not read from the pipe it is (waiting for the password and) stopped
    let writingStarted = false;
    // eslint-disable-next-line no-param-reassign
    operation.abort = () => {
      writingStarted = feeder.isOpen();
      if (!writingStarted) script.kill();
      feeder.abort();
    };

    // a script that ended leaves nobody to feed
    script.done.then(() => feeder.abort());

    const fed = await feeder.done.catch((e: Error) => e);
    if (!(fed instanceof Error) && onProgress) onProgress("checking");
    const ran = await script.done;
    // eslint-disable-next-line no-param-reassign
    operation.abort = undefined;

    if (operation.cancelled)
      throw new FlashError(
        writingStarted
          ? "Stopped. The speaker is only partly written: flash it again before you use it."
          : "Stopped. Nothing was changed on the speaker.",
        true
      );

    // the image itself was the problem
    if (fed instanceof ImageError)
      throw new FlashError(
        `${fed.message} The speaker has to be flashed again before you use it.`
      );

    const result = parseWriteScriptResult(
      await fs.promises
        .readFile(path.join(workDir, RESULT_FILE), "utf8")
        .catch(() => null)
    );

    switch (result.outcome) {
      case "ok":
        if (fed instanceof Error) break;
        if (result.sha256 !== fed.sha256)
          throw new FlashError(
            "The speaker's storage did not take the image correctly. Try again; if it keeps happening the storage of this speaker may be worn out."
          );
        return;
      case "changed":
        throw new FlashError(
          "The speaker is no longer connected the way it was, so nothing was written. Switch the speaker off and on, and start again."
        );
      case "unmount":
        throw new FlashError(
          "The speaker's storage is in use by another app, so nothing was written. Close apps that may be using it (Raspberry Pi Imager for example) and try again."
        );
      case "write":
        throw new FlashError(
          "The image could not be written to the speaker. Check that the image is not larger than the speaker's storage and that the USB cable sits tight, then flash it again."
        );
      default:
        break;
    }

    // no password, no rights
    if (result.outcome === "unknown" && ran.code !== 0 && !feeder.isOpen()) {
      if (/-128|cancel/i.test(ran.output))
        throw new FlashError(
          "Without your password KweenB is not allowed to write to the speaker. Nothing was changed on it.",
          true
        );
      console.error(`The write script did not start: ${ran.output}`);
      throw new FlashError(
        "KweenB was not allowed to write to the speaker. Nothing was changed on it. Try again and give the password of an administrator of this computer."
      );
    }

    console.error(
      `Writing the image failed (${result.outcome}): ${ran.output} ${
        fed instanceof Error ? fed.message : ""
      }`
    );
    throw new FlashError(
      "Writing the image stopped halfway. Check the USB cable and flash the speaker again."
    );
  } finally {
    // eslint-disable-next-line no-param-reassign
    operation.abort = undefined;
    await fs.promises
      .rm(workDir, { recursive: true, force: true })
      .catch(() => {});
  }
};

/**
 * Write an image to the storage of a speaker and check that it arrived.
 * Asks for the password of the user, once.
 * @param imagePath The image
 * @param disk The storage of the speaker (see openSpeakerStorage)
 * @param operation Lets the user stop writing
 * @param onProgress
 */
export const flashSpeakerStorage = async (
  imagePath: string,
  disk: DiskInfo,
  operation: FlashOperation,
  onProgress?: (step: WriteStep, percentage?: number) => void
): Promise<void> => {
  // an image that is not packed has to fit
  const problem = whyImageCannotBeUsed(imagePath);
  if (problem) throw new FlashError(problem);
  if (
    imagePath.toLowerCase().endsWith(".img") &&
    fs.statSync(imagePath).size > disk.sizeBytes
  )
    throw new FlashError(
      "This image is larger than the speaker's storage. Choose the image that was made for these speakers."
    );

  // the disk has to be the one that was shown to the user
  if (!isStillTheSameDisk(disk, await describeDisk(disk.id)))
    throw new FlashError(
      "The speaker is no longer connected the way it was, so nothing was written. Switch the speaker off and on, and start again."
    );

  await writeImage({
    imagePath,
    target: { kind: "disk", diskId: disk.id, sizeBytes: disk.sizeBytes },
    runScript: runWithAdministratorRights,
    operation,
    onProgress,
  });
};
