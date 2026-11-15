/**
 * Talking to Cloudflare R2 (which speaks the S3 protocol): putting files in
 * a bucket, getting them back and listing what is there.
 *
 * Nothing in here needs Electron, so it can be tested on its own. It uses
 * no library: requests are signed here (AWS Signature Version 4).
 */

import crypto from "crypto";
import fs from "fs";
import http from "http";
import https from "https";
import { pipeline } from "stream/promises";

export interface R2Settings {
  // the account id of Cloudflare: the first part of the address of the bucket
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  // another address than Cloudflare's (tests): http://127.0.0.1:9000
  endpoint?: string;
}

export interface R2Object {
  key: string;
  sizeBytes: number;
  // when it was put in the bucket
  modified: Date;
}

/**
 * Why R2 could not be used. The message is meant for the user.
 */
export class R2Error extends Error {
  // the answer of R2 (403, 404, ...), 0 when it could not be reached
  public status: number;

  constructor(message: string, status: number = 0) {
    super(message);
    this.name = "R2Error";
    this.status = status;
  }
}

// lets a transfer be stopped
export interface R2Operation {
  cancelled: boolean;
  abort?: () => void;
}

const REGION = "auto";
const SERVICE = "s3";
// the content is not signed: the connection is encrypted, and files of
// gigabytes do not have to be read twice
const UNSIGNED = "UNSIGNED-PAYLOAD";

const sha256Hex = (text: string): string =>
  crypto.createHash("sha256").update(text, "utf8").digest("hex");

const hmac = (key: crypto.BinaryLike, text: string): Buffer =>
  crypto.createHmac("sha256", key).update(text, "utf8").digest();

/**
 * Encode a text the way the signature wants it
 * @param slashes true leaves the slashes of a path alone
 */
export const encodeForS3 = (text: string, slashes: boolean = false): string =>
  [...Buffer.from(text, "utf8")]
    .map((byte) => {
      const char = String.fromCharCode(byte);
      if (/[A-Za-z0-9\-._~]/.test(char) || (slashes && char === "/"))
        return char;
      return `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    })
    .join("");

export interface SignedRequest {
  method: string;
  host: string;
  // the path with its query, ready to send
  path: string;
  headers: Record<string, string>;
}

/**
 * Sign a request (AWS Signature Version 4)
 * @param request.path The path, not encoded, starting with a slash
 * @param request.query The query, not encoded
 * @param request.headers More headers to send (and sign)
 * @param request.payloadHash The SHA-256 of the body, or UNSIGNED-PAYLOAD
 */
export const signRequest = (
  request: {
    method: string;
    host: string;
    path: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    payloadHash?: string;
  },
  credentials: { accessKeyId: string; secretAccessKey: string },
  now: Date = new Date(),
  region: string = REGION,
  service: string = SERVICE
): SignedRequest => {
  const amzDate = `${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  const date = amzDate.slice(0, 8);
  const payloadHash = request.payloadHash || UNSIGNED;

  const headers: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(request.headers || {}).map(([name, value]) => [
        name.toLowerCase(),
        value.trim(),
      ])
    ),
    host: request.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  const signedNames = Object.keys(headers).sort();
  const canonicalPath = encodeForS3(request.path, true);
  const canonicalQuery = Object.entries(request.query || {})
    .map(([name, value]) => [encodeForS3(name), encodeForS3(value)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, value]) => `${name}=${value}`)
    .join("&");

  const canonicalRequest = [
    request.method,
    canonicalPath,
    canonicalQuery,
    ...signedNames.map((name) => `${name}:${headers[name]}`),
    "",
    signedNames.join(";"),
    payloadHash,
  ].join("\n");

  const scope = `${date}/${region}/${service}/aws4_request`;
  const toSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const key = hmac(
    hmac(
      hmac(hmac(`AWS4${credentials.secretAccessKey}`, date), region),
      service
    ),
    "aws4_request"
  );
  const signature = hmac(key, toSign).toString("hex");

  return {
    method: request.method,
    host: request.host,
    path: canonicalQuery ? `${canonicalPath}?${canonicalQuery}` : canonicalPath,
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${
        credentials.accessKeyId
      }/${scope}, SignedHeaders=${signedNames.join(
        ";"
      )}, Signature=${signature}`,
    },
  };
};

/**
 * Read the objects out of the answer to a list request
 * @returns The objects and, when there are more, where to go on
 */
export const parseListAnswer = (
  xml: string
): { objects: R2Object[]; next: string | null } => {
  const decode = (text: string) =>
    text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  const valueOf = (block: string, tag: string): string | null => {
    const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block);
    return match ? decode(match[1]) : null;
  };
  const objects: R2Object[] = [];
  const contents = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match = contents.exec(xml);
  while (match) {
    const key = valueOf(match[1], "Key");
    if (key !== null)
      objects.push({
        key,
        sizeBytes: Number(valueOf(match[1], "Size")) || 0,
        modified: new Date(valueOf(match[1], "LastModified") || 0),
      });
    match = contents.exec(xml);
  }
  const truncated = valueOf(xml, "IsTruncated") === "true";
  return {
    objects,
    next: truncated ? valueOf(xml, "NextContinuationToken") : null,
  };
};

/**
 * What went wrong, in the words of someone who has to fix it
 */
const explain = (status: number, body: string): string => {
  const code = /<Code>([^<]*)<\/Code>/.exec(body)?.[1] || "";
  const detail = /<Message>([^<]*)<\/Message>/.exec(body)?.[1] || "";
  // for whoever looks into it (the answer of Cloudflare holds no secrets)
  console.error(`Cloudflare R2 answered ${status} ${code}: ${detail}`);
  if (code === "SignatureDoesNotMatch")
    return "Cloudflare knows the access key id, but the secret access key does not belong to it. Copy the secret again (all 64 characters, without spaces) and save.";
  if (code === "InvalidAccessKeyId" || status === 401)
    return "Cloudflare does not know this access key id. It is the one of an R2 API token (32 characters), not the token value itself.";
  if (status === 403)
    return 'Cloudflare knows the key, but it may not use this bucket. Give the R2 API token the permission "Object Read & Write" for this bucket, and check the name of the bucket and the account id.';
  if (status === 404 && code === "NoSuchBucket")
    return "Cloudflare does not know this bucket. Check its name and the account id.";
  if (status === 404) return "That file is not in the bucket.";
  return `Cloudflare answered with an error (${status}${
    code ? ` ${code}` : ""
  }).`;
};

// where the bucket is: at Cloudflare, unless another address was given
const addressOf = (settings: R2Settings): URL =>
  new URL(
    settings.endpoint ||
      `https://${settings.accountId.trim()}.r2.cloudflarestorage.com`
  );

const pathOf = (settings: R2Settings, key: string = ""): string =>
  `/${settings.bucket.trim()}${key ? `/${key}` : ""}`;

const unreachable = (e: Error, operation?: R2Operation): R2Error =>
  operation?.cancelled
    ? new R2Error("Stopped.")
    : new R2Error(
        `Cloudflare could not be reached (${e.message}). Check the internet connection of this computer.`
      );

/**
 * Start a request. The caller sends the body (if any) and ends it.
 * @returns The request and the answer that will come
 */
const open = (
  settings: R2Settings,
  request: {
    method: string;
    key?: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    // true: about the account (all its buckets), not about the bucket
    account?: boolean;
  },
  operation?: R2Operation
): { req: http.ClientRequest; answered: Promise<http.IncomingMessage> } => {
  const address = addressOf(settings);
  const signed = signRequest(
    {
      method: request.method,
      // the host as it is sent: with its port when that is not the usual one
      host: address.host,
      path: request.account ? "/" : pathOf(settings, request.key),
      query: request.query,
      headers: request.headers,
    },
    settings
  );
  const req: http.ClientRequest = (
    address.protocol === "http:" ? http : https
  ).request({
    method: signed.method,
    host: address.hostname,
    port: address.port || undefined,
    path: signed.path,
    headers: signed.headers,
  });
  const answered = new Promise<http.IncomingMessage>((resolve, reject) => {
    req.on("response", resolve);
    req.on("error", (e: Error) => reject(unreachable(e, operation)));
  });
  // nothing for half a minute: give up
  req.setTimeout(30000, () => req.destroy(new Error("no answer")));
  // eslint-disable-next-line no-param-reassign
  if (operation) operation.abort = () => req.destroy(new Error("stopped"));
  return { req, answered };
};

const bodyOf = async (response: http.IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of response) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
};

/**
 * Check an answer: anything but the expected status is an error in words
 */
const expect = async (
  response: http.IncomingMessage,
  statuses: number[]
): Promise<string> => {
  const body = await bodyOf(response);
  if (!statuses.includes(response.statusCode || 0))
    throw new R2Error(
      explain(response.statusCode || 0, body),
      response.statusCode
    );
  return body;
};

/**
 * List what is in the bucket under a prefix
 */
export const listObjects = async (
  settings: R2Settings,
  prefix: string = "",
  operation?: R2Operation
): Promise<R2Object[]> => {
  const objects: R2Object[] = [];
  let next: string | null = null;
  do {
    const query: Record<string, string> = { "list-type": "2", prefix };
    if (next) query["continuation-token"] = next;
    const { req, answered } = open(
      settings,
      { method: "GET", query },
      operation
    );
    req.end();
    // eslint-disable-next-line no-await-in-loop
    const page = parseListAnswer(await expect(await answered, [200]));
    objects.push(...page.objects);
    next = page.next;
  } while (next);
  return objects;
};

/**
 * Put a file in the bucket
 * @param onProgress Called with the number of bytes that were sent
 */
export const putFile = async (
  settings: R2Settings,
  key: string,
  filePath: string,
  operation?: R2Operation,
  onProgress?: (sentBytes: number) => void
): Promise<void> => {
  const { size } = await fs.promises.stat(filePath);
  const { req, answered } = open(
    settings,
    { method: "PUT", key, headers: { "content-length": String(size) } },
    operation
  );
  // a failure of the upload is told by `answered`
  answered.catch(() => {});
  let sent = 0;
  const file = fs.createReadStream(filePath);
  file.on("data", (chunk) => {
    sent += chunk.length;
    if (onProgress) onProgress(sent);
  });
  await pipeline(file, req).catch(() => {});
  await expect(await answered, [200]);
};

/**
 * Get a file out of the bucket. It only takes its place when all of it
 * arrived.
 * @param onProgress Called with the number of bytes that arrived
 */
export const getFile = async (
  settings: R2Settings,
  key: string,
  filePath: string,
  operation?: R2Operation,
  onProgress?: (receivedBytes: number) => void
): Promise<void> => {
  const { req, answered } = open(settings, { method: "GET", key }, operation);
  req.end();
  const response = await answered;
  if (response.statusCode !== 200) await expect(response, [200]);
  const expected = Number(response.headers["content-length"]);
  const partial = `${filePath}.part`;
  let received = 0;
  response.on("data", (chunk) => {
    received += chunk.length;
    if (onProgress) onProgress(received);
  });
  try {
    await pipeline(response, fs.createWriteStream(partial));
    if (Number.isFinite(expected) && received !== expected)
      throw new Error("incomplete");
    await fs.promises.rename(partial, filePath);
  } catch (e) {
    await fs.promises.rm(partial, { force: true });
    throw new R2Error(
      operation?.cancelled
        ? "Stopped."
        : "The download from Cloudflare broke off. Try again."
    );
  }
};

/**
 * Put a short text in the bucket
 */
export const putText = async (
  settings: R2Settings,
  key: string,
  text: string,
  operation?: R2Operation
): Promise<void> => {
  const body = Buffer.from(text, "utf8");
  const { req, answered } = open(
    settings,
    { method: "PUT", key, headers: { "content-length": String(body.length) } },
    operation
  );
  req.end(body);
  await expect(await answered, [200]);
};

/**
 * Get a short text out of the bucket
 * @returns null when it is not there
 */
export const getText = async (
  settings: R2Settings,
  key: string,
  operation?: R2Operation
): Promise<string | null> => {
  const { req, answered } = open(settings, { method: "GET", key }, operation);
  req.end();
  const response = await answered;
  if (response.statusCode === 404) {
    await bodyOf(response);
    return null;
  }
  return expect(response, [200]);
};

/**
 * Find out why Cloudflare refuses a key that it knows, by trying the things
 * that usually are the matter. Tells what it found in plain words; null
 * when it found nothing.
 */
export const whyRefused = async (
  settings: R2Settings
): Promise<{ message: string; accountId?: string } | null> => {
  const status = async (
    probe: R2Settings,
    account: boolean
  ): Promise<{ status: number; body: string }> => {
    try {
      const { req, answered } = open(probe, {
        method: "GET",
        account,
        query: account ? undefined : { "list-type": "2", "max-keys": "1" },
      });
      req.end();
      const response = await answered;
      return { status: response.statusCode || 0, body: await bodyOf(response) };
    } catch (e) {
      return { status: 0, body: "" };
    }
  };

  // 1. a bucket that has to stay in Europe (or with FedRAMP) has its own
  // address
  const account = settings.accountId.trim().replace(/\.(eu|fedramp)$/i, "");
  for (const place of ["eu", "fedramp"]) {
    if (settings.accountId.trim().toLowerCase().endsWith(`.${place}`)) continue;
    // eslint-disable-next-line no-await-in-loop
    const there = await status(
      { ...settings, accountId: `${account}.${place}` },
      false
    );
    console.error(`Cloudflare R2, bucket at .${place}: ${there.status}`);
    if (there.status === 200)
      return {
        message: `This bucket is kept in ${
          place === "eu" ? "Europe" : "a FedRAMP region"
        }: put ".${place}" behind the account id (${account}.${place}) and save.`,
        // the account id as it has to be filled in
        accountId: `${account}.${place}`,
      };
  }

  // 2. a key that may see the buckets of the account tells their names
  const buckets = await status(settings, true);
  console.error(`Cloudflare R2, the buckets of the account: ${buckets.status}`);
  if (buckets.status === 200) {
    const names = [...buckets.body.matchAll(/<Name>([^<]*)<\/Name>/g)].map(
      (match) => match[1]
    );
    console.error(`Cloudflare R2, buckets this key sees: ${names.join(", ")}`);
    if (!names.includes(settings.bucket.trim()))
      return {
        message:
          names.length > 0
            ? `This key does not see a bucket called "${settings.bucket.trim()}". It sees: ${names.join(
                ", "
              )}. Check the name of the bucket.`
            : "This key sees no bucket at all in this account. Check the account id, and that the bucket exists.",
      };
  }
  return null;
};
