/**
 * Feeds an image into the pipe the write script reads from. The image is
 * unpacked on the way; what goes into the pipe is counted and fingerprinted,
 * so it can be compared with what is read back from the speaker.
 *
 * Nothing in here needs Electron, so it can be run on its own.
 */

import { ChildProcess, spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Duplex, Transform, pipeline } from "stream";
import zlib from "zlib";

// the image is filled up with zeros to whole blocks of the storage
const BLOCK_BYTES = 4096;

// where xz is looked for before the PATH
const XZ_LOCATIONS = ["/opt/homebrew/bin/xz", "/usr/local/bin/xz"];

export type ImageKind = "img" | "gz" | "xz";

/**
 * Why an image could not be fed. The message is meant for the user: what
 * went wrong and what to try.
 */
export class ImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageError";
  }
}

export interface FeedResult {
  // the number of bytes of the unpacked image
  bytes: number;
  // the SHA-256 of the unpacked image
  sha256: string;
}

export interface FeedOptions {
  imagePath: string;
  // the pipe to write to
  pipePath: string;
  // the file that gets the number of bytes once all of them are in the pipe
  bytesPath: string;
  // called when the other side started reading
  onOpen?: () => void;
  // called with how much of the image file was read (0 - 100)
  onProgress?: (percentage: number) => void;
  // xz when it is not in its usual place (tests)
  xzPath?: string | null;
}

export interface Feeder {
  done: Promise<FeedResult>;
  // true as soon as the other side started reading
  isOpen: () => boolean;
  // stop feeding; the other side sees the pipe end without a number of bytes
  abort: () => Promise<void>;
}

/**
 * What kind of image a file is, null when it is not an image
 * @param imagePath
 */
export const imageKindOf = (imagePath: string): ImageKind | null => {
  const name = path.basename(imagePath).toLowerCase();
  if (name.endsWith(".img.gz")) return "gz";
  if (name.endsWith(".img.xz")) return "xz";
  if (name.endsWith(".img")) return "img";
  return null;
};

/**
 * Where xz is on this computer, null when it is not there
 */
export const findXz = (): string | null => {
  const onPath = (process.env.PATH || "")
    .split(path.delimiter)
    .filter((folder) => path.isAbsolute(folder))
    .map((folder) => path.join(folder, "xz"));
  for (const location of [...XZ_LOCATIONS, ...onPath]) {
    try {
      fs.accessSync(location, fs.constants.X_OK);
      if (fs.statSync(location).isFile()) return location;
    } catch (e) {
      // not here
    }
  }
  return null;
};

/**
 * Why this file cannot be flashed, in plain words (null when it can)
 * @param imagePath
 * @param xzPath xz when it is not in its usual place (tests)
 */
export const whyImageCannotBeUsed = (
  imagePath: string,
  xzPath: string | null = findXz()
): string | null => {
  const kind = imageKindOf(imagePath);
  if (!kind)
    return "This is not an image for a speaker. Choose a file that ends in .img, .img.gz or .img.xz.";
  let size = 0;
  try {
    const stat = fs.statSync(imagePath);
    if (!stat.isFile()) throw new Error("not a file");
    size = stat.size;
  } catch (e) {
    return "The image is no longer where it was. Choose it again.";
  }
  if (size === 0) return "This image is empty. Download it again.";
  if (kind === "xz" && !xzPath)
    return "This kind of file (.img.xz) cannot be opened on this computer. Use the .img.gz file of the image instead.";
  return null;
};

/**
 * Feed an image into a pipe. Opening the pipe waits until the other side
 * reads from it.
 * @param options
 */
export const feedImage = (options: FeedOptions): Feeder => {
  const { imagePath, pipePath, bytesPath, onOpen, onProgress } = options;

  let open = false;
  let aborted = false;
  let finished = false;
  let xz: ChildProcess | null = null;
  let destroyStreams: (() => void) | null = null;

  const done = (async (): Promise<FeedResult> => {
    const kind = imageKindOf(imagePath);
    const xzPath =
      options.xzPath === undefined ? findXz() : options.xzPath || null;
    const problem = whyImageCannotBeUsed(imagePath, xzPath);
    if (!kind || problem) throw new ImageError(problem || "");
    const fileSize = fs.statSync(imagePath).size;

    // wait for the other side
    const pipeFd = await fs.promises.open(pipePath, fs.constants.O_WRONLY);
    if (aborted) {
      await pipeFd.close();
      throw new Error("Feeding the image was stopped.");
    }
    open = true;
    if (onOpen) onOpen();

    // how much of the file was read
    let consumed = 0;
    let lastPercentage = -1;
    const meter = new Transform({
      transform(chunk: Buffer, encoding, callback) {
        consumed += chunk.length;
        const percentage = Math.min(
          100,
          Math.floor((consumed / fileSize) * 100)
        );
        if (percentage !== lastPercentage && onProgress) onProgress(percentage);
        lastPercentage = percentage;
        callback(null, chunk);
      },
    });

    // unpack
    let unpack: Duplex | null = null;
    let unpacked: Promise<void> = Promise.resolve();
    if (kind === "gz") unpack = zlib.createGunzip();
    if (kind === "xz" && xzPath) {
      const child = spawn(xzPath, ["-dc"], {
        stdio: ["pipe", "pipe", "ignore"],
      });
      xz = child;
      // only when xz ended well all of the image came out of it
      unpacked = new Promise((resolve, reject) => {
        child.on("error", reject);
        child.on("close", (code) =>
          code === 0 ? resolve() : reject(new Error(`xz ended with ${code}`))
        );
      });
      unpacked.catch(() => {});
      unpack = Duplex.from({ writable: child.stdin, readable: child.stdout });
    }

    // count and fingerprint what goes into the pipe
    const hash = crypto.createHash("sha256");
    let bytes = 0;
    const counter = new Transform({
      transform(chunk: Buffer, encoding, callback) {
        bytes += chunk.length;
        hash.update(chunk);
        callback(null, chunk);
      },
      flush(callback) {
        unpacked
          .then(async () => {
            if (aborted) throw new Error("Feeding the image was stopped.");
            if (bytes === 0) throw new Error("The image is empty.");
            // tell how long the image was before the pipe ends
            await fs.promises.writeFile(bytesPath, String(bytes));
            const rest = bytes % BLOCK_BYTES;
            if (rest > 0) this.push(Buffer.alloc(BLOCK_BYTES - rest));
            callback();
          })
          .catch((e) => callback(e));
      },
    });

    const source = fs.createReadStream(imagePath, {
      highWaterMark: 1024 * 1024,
    });
    const sink = pipeFd.createWriteStream();
    const transforms = [meter, ...(unpack ? [unpack] : []), counter];
    destroyStreams = () =>
      [source, ...transforms, sink].forEach((stream) => stream.destroy());

    try {
      await new Promise<void>((resolve, reject) => {
        const all: (
          | NodeJS.ReadableStream
          | NodeJS.WritableStream
          | NodeJS.ReadWriteStream
        )[] = [source, ...transforms, sink];
        pipeline(all, (e: NodeJS.ErrnoException | null) =>
          e ? reject(e) : resolve()
        );
      });
    } catch (e: any) {
      if (xz) xz.kill();
      // the other side went away, or we were told to stop
      if (aborted || e?.code === "EPIPE") throw e;
      // what is left is an image that cannot be read to its end
      throw new ImageError(
        kind === "img"
          ? "The image could not be read from this computer. Choose it again."
          : "The image is damaged: it could not be unpacked. Download it again."
      );
    }

    finished = true;
    return { bytes, sha256: hash.digest("hex") };
  })();

  // whoever waits for the result handles the error
  done.catch(() => {});

  const abort = async () => {
    if (aborted || finished) return;
    aborted = true;
    if (xz) xz.kill();

    if (open) {
      // closing the pipe makes the other side end
      if (destroyStreams) destroyStreams();
    } else {
      // nobody reads the pipe yet: become a reader ourselves so opening it
      // comes to an end, and take the pipe away so nobody waits for it later
      let guard: fs.promises.FileHandle | null = null;
      try {
        guard = await fs.promises.open(
          pipePath,
          fs.constants.O_RDWR | fs.constants.O_NONBLOCK
        );
        await fs.promises.unlink(pipePath);
      } catch (e) {
        // the pipe is already gone
      }
      await done.catch(() => {});
      if (guard) await guard.close().catch(() => {});
      return;
    }
    await done.catch(() => {});
  };

  return { done, isOpen: () => open, abort };
};
