const https = require("https");
const fs = require("fs");
const logger = require("./logger");
const { spawnSync } = require("child_process");

/**
 * Some constants
 */

const owner = "jacktrip";
const repo = "jacktrip";
const release = "2.2.5";

/**
 * Download the release
 * @param {*} url The URL to download the release from
 * @param {*} wStream The write stream to write the downloaded data to
 * @param {*} progress The callback to report the progress
 * @returns
 */
const downloadRelease = (url, wStream, progress = () => {}) => {
  return new Promise((resolve, reject) => {
    let protocol = /^https:/.exec(url) ? https : http;

    progress(0);

    protocol
      .get(url, (res1) => {
        protocol = /^https:/.exec(res1.headers.location) ? https : http;

        protocol
          .get(res1.headers.location, (res2) => {
            const total = parseInt(res2.headers["content-length"], 10);
            let completed = 0;
            res2.pipe(wStream);
            res2.on("data", (data) => {
              completed += data.length;
              progress(completed / total);
            });
            res2.on("progress", progress);
            res2.on("error", reject);
            res2.on("end", resolve);
          })
          .on("error", reject);
      })
      .on("error", reject);
  });
};

/**
 * Get the asset
 * @param {*} assets Assets to search
 * @param {*} desiredFileNameRegex Desired file name regex
 * @returns
 */
const getAsset = async (assets, desiredFileNameRegex) => {
  const options = {
    hostname: "api.github.com",
    path: `/repos/${owner}/${repo}/releases/tags/v${release}`,
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
        const release = JSON.parse(data);
        const assets = release.assets;

        // Find the asset with the desired file name
        const desiredFileNameRegex =
          /^JackTrip-v(\d+\.\d+\.\d+)-macOS-x64-application\.zip$/;
        const asset = assets.find((asset) =>
          desiredFileNameRegex.test(asset.name)
        );

        resolve(asset);
      });

      res.on("error", (err) => {
        reject(err);
      });
    });
  });
};

const downloadLatestRelease = async () => {
  // log
  logger.info("Getting latest JackTrip release.");

  // get the asset
  const asset = await getAsset();

  if (asset) {
    // download and unpack the asset
    const targetPath = "./resources/jacktrip"; // Replace with the desired target path

    // log
    logger.info("Clear the JackTrip folder.");

    // clear the folder
    fs.rmSync(targetPath, { recursive: true, force: true });

    // create the folder
    fs.mkdirSync(targetPath);

    // log
    logger.info(`Downloading ${asset.name}...`);

    // target file path
    const targetFilePath = targetPath + "/" + asset.name;

    // create the file
    const file = fs.createWriteStream(targetFilePath);

    // download the asset
    await downloadRelease(asset.browser_download_url, file);

    // log
    logger.info(`Unpacking the packed file...`);

    // unzip the file
    spawnSync("unzip", [targetFilePath, "-d", targetPath]);

    // log
    logger.info(`Removing redundant files...`);

    // Remove everything in the folder except JackTrip.app
    fs.readdirSync(targetPath).forEach((file) => {
      if (file !== "JackTrip.app") {
        fs.rmSync(targetPath + "/" + file, { recursive: true, force: true });
      }
    });
  } else {
    console.log("Asset not found.");
  }
};

(async () => {
  await downloadLatestRelease();
})();
