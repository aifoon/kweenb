/**
 * New versions of KweenB itself: they are published as releases of
 * github.com/aifoon/kweenb.
 */

import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { isNewer } from "./Versions";

const LATEST_RELEASE =
  "https://api.github.com/repos/aifoon/kweenb/releases/latest";
export const RELEASES_PAGE = "https://github.com/aifoon/kweenb/releases/latest";

export interface KweenBRelease {
  version: string;
  // the page of the release
  page: string;
  // the installer for this computer; null when the release has none
  installer: { name: string; url: string; sizeBytes: number } | null;
}

/**
 * The installer of a release for this computer: release files are named
 * kweenb-<version>-<mac|linux>-<processor>.<dmg|deb>
 */
export const installerFor = <T extends { name: string }>(
  files: T[],
  platform: string = process.platform,
  arch: string = process.arch
): T | null => {
  const system = platform === "darwin" ? "mac" : "linux";
  const extension = platform === "darwin" ? ".dmg" : ".deb";
  // electron-builder names the processors of a deb its own way
  const processors =
    arch === "x64" ? ["x64", "amd64"] : arch === "arm" ? ["armv7l"] : [arch];
  return (
    files.find(
      (file) =>
        file.name.endsWith(extension) &&
        file.name.includes(`-${system}-`) &&
        processors.some((processor) => file.name.includes(`-${processor}.`))
    ) || null
  );
};

/**
 * The newest release of KweenB
 */
export const latestRelease = async (): Promise<KweenBRelease> => {
  const response = await fetch(LATEST_RELEASE, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "kweenb" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`);
  const release = (await response.json()) as {
    tag_name?: string;
    html_url?: string;
    assets?: { name: string; browser_download_url: string; size: number }[];
  };
  const version = String(release.tag_name || "").replace(/^v/, "");
  if (!/^\d+\.\d+\.\d+/.test(version))
    throw new Error("The newest release has no version");
  const installer = installerFor(release.assets || []);
  return {
    version,
    page: release.html_url || RELEASES_PAGE,
    installer: installer
      ? {
          name: installer.name,
          url: installer.browser_download_url,
          sizeBytes: installer.size,
        }
      : null,
  };
};

export const isNewerRelease = (release: KweenBRelease, current: string) =>
  isNewer(release.version, current);

/**
 * Download the installer of a release
 * @param folder Where to put it
 * @param onProgress Called with the part that arrived, from 0 to 1
 * @returns The path of the installer
 */
export const downloadInstaller = async (
  installer: { name: string; url: string; sizeBytes: number },
  folder: string,
  onProgress?: (part: number) => void
): Promise<string> => {
  const target = path.join(folder, path.basename(installer.name));
  const partial = `${target}.part`;
  const response = await fetch(installer.url, {
    headers: { "User-Agent": "kweenb" },
  });
  if (!response.ok || !response.body)
    throw new Error(`GitHub answered ${response.status}`);
  let received = 0;
  const body = Readable.fromWeb(response.body as any);
  body.on("data", (chunk: Buffer) => {
    received += chunk.length;
    if (onProgress && installer.sizeBytes > 0)
      onProgress(Math.min(1, received / installer.sizeBytes));
  });
  try {
    await pipeline(body, fs.createWriteStream(partial));
    if (installer.sizeBytes > 0 && received !== installer.sizeBytes)
      throw new Error("incomplete");
    await fs.promises.rename(partial, target);
  } catch (e) {
    await fs.promises.rm(partial, { force: true });
    throw e;
  }
  return target;
};
