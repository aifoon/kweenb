/**
 * A client for the API that runs on every bee (zwerm3 API v2).
 * Everything kweenb asks of a bee goes through here, except the triggers:
 * those go straight to Pure Data as OSC.
 */

import crypto from "crypto";
import fs from "fs";
import http from "http";
import {
  BeeBatteryLevel,
  BeeStreamMode,
  BeeStreamState,
} from "@shared/interfaces";
import { ZWERM3API_PORT } from "../../consts";

/**
 * The answers of the API
 */

export interface SpeakerIdentity {
  // null for a speaker that has no number yet
  id: number | null;
  name: string;
  hostname: string;
}

export interface SpeakerStreamStatus {
  state: BeeStreamState;
  mode: BeeStreamMode | null;
  error: string | null;
  jack: boolean;
  jacktrip: boolean;
  pd: boolean;
  runningSeconds: number;
  restarts: number;
  xruns: number;
  glitches: number;
}

export interface SpeakerStatus {
  apiVersion: string;
  identity: SpeakerIdentity;
  stream: SpeakerStreamStatus;
  battery: {
    present: boolean;
    voltage: number | null;
    current: number | null;
    power: number | null;
    percentage: number | null;
    level: BeeBatteryLevel | null;
  };
  storage: { freeMb: number; totalMb: number; scenes: number };
  wifiSignalDbm: number | null;
  // the loudest the speaker played in the last seconds, in dB below full scale
  outputLevelDb?: number | null;
  // what went over the Wi-Fi since the speaker started
  network?: {
    receivedBytes: number;
    receivedPackets: number;
    sentBytes: number;
    sentPackets: number;
    linkMbps: number | null;
  } | null;
  uptimeSeconds: number;
  // what the clock of the speaker says
  time?: string;
}

export interface SpeakerScene {
  name: string;
  legalName: string;
  oscAddress: string;
  sizeBytes: number;
  sha256: string | null;
  modified: string;
}

/**
 * The requests
 */

export interface SpeakerAudioFormat {
  sampleRate: number;
  bufferSize: number;
  bitRate: number;
  // the number of blocks in the sound card buffer
  periods: number;
  // how long Jacktrip waits for late packets, in milliseconds
  networkBuffer: number;
  // 1: mono (the default), 2: stereo
  channels?: number;
}

export interface SpeakerStreamRequest {
  mode: BeeStreamMode;
  // the address of kweenb (hub mode)
  host?: string;
  // the port of the hub server (hub mode) or to listen on (p2p mode)
  port?: number;
  audio: SpeakerAudioFormat;
}

export interface SpeakerUploadOptions {
  // called with the percentage (0 - 100) that was sent
  onProgress?: (percentage: number) => void;
  // receives a function that stops the upload
  onAbortable?: (abort: () => void) => void;
}

export interface SpeakerDownloadOptions {
  // called with the number of bytes that arrived
  onProgress?: (receivedBytes: number) => void;
  // receives a function that stops the download
  onAbortable?: (abort: () => void) => void;
}

/**
 * Timeouts
 */

// asking for the state of a bee: a bee that does not answer fast is gone
const STATUS_TIMEOUT_MS = 3000;

// starting the chain: Jack, Jacktrip and Pure Data each get their time
const STREAM_START_TIMEOUT_MS = 40000;

// stopping the chain, deleting a scene, restarting, ...
const ACTION_TIMEOUT_MS = 15000;

// an upload may take as long as it needs, as long as data keeps moving
const UPLOAD_IDLE_TIMEOUT_MS = 30000;

// a download may take as long as it needs, as long as data keeps moving
const DOWNLOAD_IDLE_TIMEOUT_MS = 30000;

// calculating the checksum of a big scene takes the bee a while
const CHECKSUM_TIMEOUT_MS = 60000;

// the status stream: a message every 2 seconds, so this long without one
// means the bee is gone
const EVENTS_SILENCE_MS = 6000;

// the pause before a lost status stream is opened again
const EVENTS_RECONNECT_MS = 2000;

/**
 * An error the API answered with (or the reason it could not be reached)
 */
export class SpeakerApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 0) {
    super(message);
    this.name = "SpeakerApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Create the full url, based on the ipAddress and path
 */
const createUrl = (ipAddress: string, path: string): string =>
  `http://${ipAddress}:${ZWERM3API_PORT}/${path}`;

/**
 * Make the message of an error answer readable. The API answers with
 * { statusCode, message } where message is a string or a list of strings.
 */
const readErrorMessage = (body: string, statusCode: number): string => {
  try {
    const { message } = JSON.parse(body);
    if (Array.isArray(message) && message.length > 0) return message.join(", ");
    if (typeof message === "string" && message) return message;
  } catch (e) {
    // not JSON, fall through
  }
  return `The speaker answered with an error (${statusCode})`;
};

/**
 * Describe why a request did not get an answer
 */
const readFailure = (e: any, timeoutMs: number): string => {
  if (e?.name === "AbortError" || e?.name === "TimeoutError")
    return `The speaker did not answer within ${Math.round(
      timeoutMs / 1000
    )} seconds`;
  const code = e?.cause?.code || e?.code;
  if (code === "ECONNREFUSED") return "The speaker API is not running";
  if (
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH" ||
    code === "EHOSTDOWN" ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT"
  )
    return "The speaker can not be reached";
  if (code === "ECONNRESET" || code === "UND_ERR_SOCKET" || code === "EPIPE")
    return "The connection with the speaker was lost";
  return e?.message || "The speaker can not be reached";
};

/**
 * Do a request that answers with JSON
 */
const request = async <T>(
  ipAddress: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  timeoutMs: number,
  body?: unknown
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(createUrl(ipAddress, path), {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok)
      throw new SpeakerApiError(
        readErrorMessage(text, response.status),
        response.status
      );
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (e: any) {
    if (e instanceof SpeakerApiError) throw e;
    throw new SpeakerApiError(readFailure(e, timeoutMs));
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Get the status of a bee
 * @param ipAddress
 */
const getStatus = (ipAddress: string): Promise<SpeakerStatus> =>
  request<SpeakerStatus>(ipAddress, "GET", "status", STATUS_TIMEOUT_MS);

/**
 * Follow the status of a bee: it sends its status right away and then every
 * two seconds (server-sent events). The connection is opened again whenever
 * it is lost, until the returned function is called.
 * @param ipAddress
 * @param onStatus Called for every status the bee sends
 * @returns A function that stops following
 */
const followStatus = (
  ipAddress: string,
  onStatus: (status: SpeakerStatus) => void
): (() => void) => {
  let stopped = false;
  let controller: AbortController | null = null;
  let silenceTimeout: NodeJS.Timeout | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  // a connection without messages is closed: a bee that lost its power
  // does not tell it is gone
  const expectMessage = () => {
    if (silenceTimeout) clearTimeout(silenceTimeout);
    silenceTimeout = setTimeout(() => controller?.abort(), EVENTS_SILENCE_MS);
  };

  const listen = async () => {
    const connection = new AbortController();
    controller = connection;
    expectMessage();
    try {
      const response = await fetch(createUrl(ipAddress, "events"), {
        headers: { Accept: "text/event-stream" },
        signal: connection.signal,
      });
      if (!response.ok || !response.body) {
        // free the connection before giving up on it
        await response.body?.cancel();
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // every message ends with an empty line
        const { messages, rest } = splitServerSentEvents(buffer);
        buffer = rest;
        for (const message of messages) {
          try {
            const status = JSON.parse(message) as SpeakerStatus;
            expectMessage();
            if (!stopped) onStatus(status);
          } catch (e) {
            // not a status, ignore
          }
        }
      }
    } catch (e) {
      // the bee is gone or not there yet: try again later
    } finally {
      if (silenceTimeout) clearTimeout(silenceTimeout);
      connection.abort();
    }
  };

  const loop = async () => {
    while (!stopped) {
      await listen();
      if (stopped) break;
      await new Promise<void>((resolve) => {
        reconnectTimeout = setTimeout(resolve, EVENTS_RECONNECT_MS);
      });
    }
  };
  loop();

  return () => {
    stopped = true;
    if (silenceTimeout) clearTimeout(silenceTimeout);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    controller?.abort();
  };
};

/**
 * Take the complete messages out of a piece of a server-sent event stream
 * @param buffer What was received and not handled yet
 * @returns The data of every complete message and what is left over
 */
export const splitServerSentEvents = (
  buffer: string
): { messages: string[]; rest: string } => {
  const messages: string[] = [];
  const blocks = buffer.replace(/\r\n?/g, "\n").split("\n\n");

  // the last block is not complete yet
  const rest = blocks.pop() || "";

  blocks.forEach((block) => {
    const data = block
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");
    if (data) messages.push(data);
  });

  return { messages, rest };
};

/**
 * Start Jack, Jacktrip and Pure Data on a bee. Answers when sound can pass,
 * a start replaces whatever was running.
 * @param ipAddress
 * @param streamRequest
 */
const startStream = (
  ipAddress: string,
  streamRequest: SpeakerStreamRequest
): Promise<SpeakerStreamStatus> =>
  request<SpeakerStreamStatus>(
    ipAddress,
    "POST",
    "stream/start",
    STREAM_START_TIMEOUT_MS,
    streamRequest
  );

/**
 * Stop Jack, Jacktrip and Pure Data on a bee
 * @param ipAddress
 */
const stopStream = (ipAddress: string): Promise<SpeakerStreamStatus> =>
  request<SpeakerStreamStatus>(
    ipAddress,
    "POST",
    "stream/stop",
    ACTION_TIMEOUT_MS
  );

/**
 * Get the audio scenes that are stored on a bee
 * @param ipAddress
 */
const getScenes = (ipAddress: string): Promise<SpeakerScene[]> =>
  request<SpeakerScene[]>(ipAddress, "GET", "scenes", ACTION_TIMEOUT_MS);

/**
 * Calculate the sha256 checksum of a file
 * @param filePath
 */
export const checksumOfFile = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    fs.createReadStream(filePath)
      .on("error", reject)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")));
  });

/**
 * Upload the audio of a scene to a bee. The bee only accepts the file when
 * it arrived complete (the checksum is calculated first and sent along).
 * @param ipAddress
 * @param legalName The folder name of the scene (lower case letters, digits and underscores)
 * @param name The name of the scene as the user wrote it
 * @param filePath The wav file
 * @param options Progress and a way to stop the upload
 */
const uploadScene = async (
  ipAddress: string,
  legalName: string,
  name: string,
  filePath: string,
  options: SpeakerUploadOptions = {}
): Promise<SpeakerScene> => {
  let aborted = false;
  let abortUpload = () => {
    aborted = true;
  };
  if (options.onAbortable) options.onAbortable(() => abortUpload());

  const { size } = await fs.promises.stat(filePath);
  const sha256 = await checksumOfFile(filePath);
  if (aborted) throw new SpeakerApiError("The upload was cancelled");

  // fetch can not send a file of a known length as a stream, so this
  // request is made with the http module
  return new Promise<SpeakerScene>((resolve, reject) => {
    let settled = false;
    const file = fs.createReadStream(filePath);

    const settle = (error: Error | null, scene?: SpeakerScene) => {
      if (settled) return;
      settled = true;
      file.destroy();
      if (error) {
        req.destroy();
        reject(error);
      } else resolve(scene as SpeakerScene);
    };

    const req: http.ClientRequest = http.request(
      createUrl(ipAddress, `scenes/${encodeURIComponent(legalName)}`),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": size,
          "X-Scene-Name": encodeURIComponent(name),
          "X-Sha256": sha256,
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("error", (e) =>
          settle(new SpeakerApiError(readFailure(e, UPLOAD_IDLE_TIMEOUT_MS)))
        );
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          const statusCode = response.statusCode || 0;
          if (statusCode < 200 || statusCode >= 300) {
            settle(
              new SpeakerApiError(
                readErrorMessage(text, statusCode),
                statusCode
              )
            );
            return;
          }
          try {
            settle(null, JSON.parse(text) as SpeakerScene);
          } catch (e) {
            settle(
              new SpeakerApiError("The speaker gave an unreadable answer")
            );
          }
        });
      }
    );

    abortUpload = () => {
      aborted = true;
      settle(new SpeakerApiError("The upload was cancelled"));
    };

    req.setTimeout(UPLOAD_IDLE_TIMEOUT_MS, () => {
      settle(
        new SpeakerApiError(
          readFailure({ name: "TimeoutError" }, UPLOAD_IDLE_TIMEOUT_MS)
        )
      );
    });

    req.on("error", (e) => {
      // a bee that refuses the upload (e.g. no space left) answers and
      // closes the connection while the file is still being sent: give
      // that answer the time to arrive before reporting the lost connection
      setTimeout(
        () =>
          settle(new SpeakerApiError(readFailure(e, UPLOAD_IDLE_TIMEOUT_MS))),
        500
      );
    });

    // report what was handed to the network
    let sent = 0;
    file.on("data", (chunk) => {
      sent += chunk.length;
      if (options.onProgress && size > 0)
        options.onProgress((sent / size) * 100);
    });
    file.on("error", (e) => {
      settle(new SpeakerApiError(`The file could not be read: ${e.message}`));
    });

    // pipe respects the pace of the network, so the progress is real
    file.pipe(req);
  });
};

/**
 * Get the sha256 checksum of the audio of a scene. The bee calculates (and
 * remembers) it when it was not known yet.
 * @param ipAddress
 * @param legalName The folder name of the scene
 */
const getSceneChecksum = async (
  ipAddress: string,
  legalName: string
): Promise<string> =>
  (
    await request<{ sha256: string }>(
      ipAddress,
      "GET",
      `scenes/${encodeURIComponent(legalName)}/checksum`,
      CHECKSUM_TIMEOUT_MS
    )
  ).sha256;

/**
 * Download the audio of a scene from a bee into a file
 * @param ipAddress
 * @param legalName The folder name of the scene
 * @param filePath The file to write (it is replaced when it exists)
 * @param options Progress and a way to stop the download
 * @returns The sha256 checksum of what was written
 */
const downloadScene = async (
  ipAddress: string,
  legalName: string,
  filePath: string,
  options: SpeakerDownloadOptions = {}
): Promise<string> => {
  const controller = new AbortController();
  let cancelled = false;
  if (options.onAbortable)
    options.onAbortable(() => {
      cancelled = true;
      controller.abort();
    });

  // a bee that stops sending is gone
  let idleTimeout: NodeJS.Timeout | null = null;
  const expectData = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(
      () => controller.abort(),
      DOWNLOAD_IDLE_TIMEOUT_MS
    );
  };

  const file = fs.createWriteStream(filePath);
  let fileError: Error | null = null;
  const fileClosed = new Promise<void>((resolve) => {
    file.on("error", (e) => {
      fileError = e;
      controller.abort();
      resolve();
    });
    file.on("close", () => resolve());
  });

  try {
    expectData();
    const response = await fetch(
      createUrl(ipAddress, `scenes/${encodeURIComponent(legalName)}/audio`),
      { signal: controller.signal }
    );
    if (!response.ok)
      throw new SpeakerApiError(
        readErrorMessage(await response.text(), response.status),
        response.status
      );
    if (!response.body)
      throw new SpeakerApiError("The speaker gave an unreadable answer");

    const hash = crypto.createHash("sha256");
    const reader = response.body.getReader();
    let received = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      expectData();
      hash.update(value);
      received += value.length;

      // write at the pace of the disk
      if (!file.write(value))
        await Promise.race([
          new Promise<void>((resolve) => file.once("drain", () => resolve())),
          fileClosed,
        ]);
      if (fileError) throw fileError;
      if (options.onProgress) options.onProgress(received);
    }

    file.end();
    await fileClosed;
    if (fileError) throw fileError;
    return hash.digest("hex");
  } catch (e: any) {
    file.destroy();
    if (e instanceof SpeakerApiError) throw e;
    if (cancelled) throw new SpeakerApiError("The download was cancelled");
    if (fileError)
      throw new SpeakerApiError(
        `The file could not be written: ${(fileError as Error).message}`
      );
    throw new SpeakerApiError(readFailure(e, DOWNLOAD_IDLE_TIMEOUT_MS));
  } finally {
    if (idleTimeout) clearTimeout(idleTimeout);
  }
};

/**
 * Remove an audio scene from a bee
 * @param ipAddress
 * @param legalName The folder name of the scene
 */
const deleteScene = (ipAddress: string, legalName: string): Promise<void> =>
  request<void>(
    ipAddress,
    "DELETE",
    `scenes/${encodeURIComponent(legalName)}`,
    ACTION_TIMEOUT_MS
  );

/**
 * Follow the level of the sound that leaves a bee, about ten times a second
 * (a live meter). Every message is a packet on the Wi-Fi, so this is only
 * kept open for a bee someone is looking at.
 * @param ipAddress
 * @param onLevel Called with the level in dB below full scale
 * @returns A function that stops following
 */
const followLevel = (
  ipAddress: string,
  onLevel: (levelDb: number) => void
): (() => void) => {
  let stopped = false;
  let controller: AbortController | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;

  const listen = async () => {
    const connection = new AbortController();
    controller = connection;
    try {
      const response = await fetch(createUrl(ipAddress, "level/events"), {
        headers: { Accept: "text/event-stream" },
        signal: connection.signal,
      });
      if (!response.ok || !response.body) {
        await response.body?.cancel();
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { messages, rest } = splitServerSentEvents(buffer);
        buffer = rest;
        messages.forEach((message) => {
          const level = Number(message);
          if (!stopped && message.trim() !== "" && Number.isFinite(level))
            onLevel(level);
        });
      }
    } catch (e) {
      // the bee is gone, or it does not tell its level: try again later
    } finally {
      connection.abort();
    }
  };

  const loop = async () => {
    while (!stopped) {
      await listen();
      if (stopped) break;
      await new Promise<void>((resolve) => {
        reconnectTimeout = setTimeout(resolve, EVENTS_RECONNECT_MS);
      });
    }
  };
  loop();

  return () => {
    stopped = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    controller?.abort();
  };
};

/**
 * Set the clock of a bee to the clock of this computer. A bee has no
 * internet and forgets the time when it is switched off.
 * @param ipAddress
 */
const setTime = (ipAddress: string): Promise<void> =>
  request<void>(ipAddress, "PUT", "system/time", STATUS_TIMEOUT_MS, {
    time: new Date().toISOString(),
  });

/**
 * Is the clock of a bee off by more than a few seconds
 * @param speakerTime The time in the status of the bee
 * @param now The time on this computer, in milliseconds
 */
export const isClockOff = (
  speakerTime: string | undefined,
  now: number = Date.now()
): boolean => {
  // a bee that does not tell its time can not be told the time either
  if (!speakerTime) return false;
  const time = Date.parse(speakerTime);
  return !Number.isFinite(time) || Math.abs(time - now) > 5000;
};

/**
 * Restart a bee
 * @param ipAddress
 */
const reboot = (ipAddress: string): Promise<void> =>
  request<void>(ipAddress, "POST", "system/reboot", ACTION_TIMEOUT_MS);

/**
 * Switch off a bee
 * @param ipAddress
 */
const shutdown = (ipAddress: string): Promise<void> =>
  request<void>(ipAddress, "POST", "system/shutdown", ACTION_TIMEOUT_MS);

/**
 * Get the number and names of a bee
 * @param ipAddress
 */
const getIdentity = (ipAddress: string): Promise<SpeakerIdentity> =>
  request<SpeakerIdentity>(ipAddress, "GET", "identity", STATUS_TIMEOUT_MS);

/**
 * Give a bee its number (1 - 99). About two seconds after the answer the bee
 * renames itself and moves to its fixed address.
 * @param ipAddress
 * @param id
 */
const setIdentity = (ipAddress: string, id: number): Promise<SpeakerIdentity> =>
  request<SpeakerIdentity>(ipAddress, "PUT", "identity", ACTION_TIMEOUT_MS, {
    id,
  });

export default {
  checksumOfFile,
  deleteScene,
  downloadScene,
  followLevel,
  followStatus,
  getIdentity,
  getSceneChecksum,
  getScenes,
  getStatus,
  reboot,
  setIdentity,
  setTime,
  shutdown,
  startStream,
  stopStream,
  uploadScene,
};
