const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");
require("dotenv").config();
const { createLogger } = require("vite");

/**
 * Prepare API requests
 */

const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const logger = createLogger("info", { prefix: "[scripts]" });
const binDir = path.join(process.cwd(), "bin");
const tagname = process.env.npm_config_tagname;
const owner = "aifoon";
const repo = "kweenb";

const publish = async () => {
  /**
   * Create a new release
   */

  // logger.info("Creating new release...");
  // const release = await octokit.rest.repos.createRelease({
  //   owner,
  //   repo,
  //   tag_name: tagname,
  //   name: tagname,
  //   body: "",
  //   draft: false,
  //   prerelease: false,
  //   generate_release_notes: false,
  // });

  const notes = await octokit.rest.repos.generateReleaseNotes({
    owner,
    repo,
    tag_name: tagname,
  });

  console.log(notes.data.body);
  /**
   * Upload the binaries
   */

  // fs.readdirSync(binDir)
  //   .filter((file) => file.endsWith(".dmg"))
  //   .forEach(async (file) => {
  //     const binaryFile = fs.readFileSync(path.join(binDir, file));
  //     logger.info(`Uploading binary ${file}...`);
  //     await octokit.rest.repos.uploadReleaseAsset({
  //       owner,
  //       repo,
  //       name: file,
  //       release_id: release.data.id,
  //       data: binaryFile,
  //     });
  //   });
};

publish();
