import https from "https";
import http from "http";
import fs from "fs";
import { spawnSync } from "child_process";

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

/**
 * The Installer class
 */
export abstract class Installer {
  private _version = "";
  private _owner = "";
  private _repo = "";
  private _fileNameRegEx: RegExp = /./;
  protected _targetPath = "";

  constructor(
    version: string,
    owner: string,
    repo: string,
    fileNameRegEx: RegExp,
    targetPath: string
  ) {
    this._version = version;
    this._owner = owner;
    this._repo = repo;
    this._fileNameRegEx = fileNameRegEx;
    this._targetPath = targetPath;
  }

  /**
   * Download a release from GitHub
   * @param {*} url The URL to download the release from
   * @param {*} wStream The write stream to write the downloaded data to
   * @param {*} progress The callback to report the progress
   * @returns
   */
  protected downloadRelease(
    url: any,
    wStream: any,
    progressCallback = (progress: Number) => {}
  ) {
    return new Promise((resolve, reject) => {
      let protocol = /^https:/.exec(url) ? https : http;

      progressCallback(0);

      protocol
        .get(url, (res1) => {
          protocol = /^https:/.exec(res1.headers.location as string)
            ? https
            : http;

          protocol
            .get(res1.headers.location as string, (res2) => {
              const total = parseInt(
                res2.headers["content-length"] as string,
                10
              );
              let completed = 0;
              res2.pipe(wStream);
              res2.on("data", (data) => {
                completed += data.length;
                progressCallback(completed / total);
              });
              res2.on("progress", progressCallback);
              res2.on("error", reject);
              res2.on("end", resolve);
            })
            .on("error", reject);
        })
        .on("error", reject);
    });
  }

  /**
   * Get the asset
   * @param {*} assets Assets to search
   * @param {*} desiredFileNameRegex Desired file name regex
   * @returns
   */
  protected async getAsset(): Promise<GitHubAsset> {
    const options = {
      hostname: "api.github.com",
      path: `/repos/${this._owner}/${this._repo}/releases/tags/v${this._version}`,
      headers: {
        "User-Agent": "GitHub Copilot",
      },
    };

    return new Promise((resolve, reject) => {
      https.get(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const releaseJson = JSON.parse(data);
          const assets = releaseJson.assets;

          // Find the asset with the desired file name
          const asset = assets.find((asset: any) =>
            this._fileNameRegEx.test(asset.name)
          );

          resolve(asset);
        });

        res.on("error", (err) => {
          reject(err);
        });
      });
    });
  }

  /**
   * Install the asset
   */
  public async install(): Promise<void> {
    // get the asset
    const asset = await this.getAsset();

    // if the asset exists
    if (asset) {
      // check if the target path exists
      if (fs.existsSync(this._targetPath)) {
        fs.rmSync(this._targetPath, { recursive: true, force: true });
      }

      // create the folder
      fs.mkdirSync(this._targetPath);

      // target file path
      const targetFilePath = this._targetPath + "/" + asset.name;

      // create the file
      const file = fs.createWriteStream(targetFilePath);

      // download the asset
      await this.downloadRelease(asset.browser_download_url, file);

      // unzip the file
      spawnSync("unzip", [targetFilePath, "-d", this._targetPath]);

      // run the after install
      await this.afterInstall();
    }
  }

  abstract afterInstall(): Promise<void>;
}
