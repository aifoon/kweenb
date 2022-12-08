const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest");
require("dotenv").config();
const { createLogger } = require("vite");
var { version } = require("../package.json");

/**
 * Prepare API requests
 */

const octokit = new Octokit({ auth: process.env.GH_TOKEN });
const logger = createLogger("info", { prefix: "[scripts]" });
const binDir = path.join(process.cwd(), "bin");
const tagname = `v${version}`;
const owner = "aifoon";
const repo = "kweenb";

const publish = async () => {
  // show the outer world what we are doing
  logger.info("Creating new release...");

  /**
   * The current tags for this repo
   */

  let { data: tagData } = await octokit.rest.repos.listTags({
    owner,
    repo,
  });

  // check if the current version already exists
  const tagExists = tagData.filter((t) => t.name === tagname).length > 0;

  // validate
  if (tagExists) {
    logger.warn(`Version ${version} already published.`);
    return;
  }

  // get the last commit
  const lastCommitSha = (
    await octokit.rest.repos.listCommits({
      owner,
      repo,
    })
  ).data[0].sha;

  // version does not exist, create a new ref with the last commit
  octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${tagname}`,
    sha: lastCommitSha,
  });

  /**
   * Generate the Release Notes
   */

  // define the release notes
  let releaseNotes = "";

  // get the tagdata with the new tag
  let { data: updatedTagData } = await octokit.rest.repos.listTags({
    owner,
    repo,
  });

  // get the current, requested tag
  const currentTag = updatedTagData.find((tag) => tag.name === tagname);
  // get the previous tag, so we can find the difference between the two
  const previousTag =
    updatedTagData[updatedTagData.findIndex((tag) => tag.name === tagname) + 1];

  // if we found the current and previous tag
  if (currentTag && previousTag) {
    // get the commits
    const commits = await octokit.repos.compareCommitsWithBasehead({
      owner,
      repo,
      basehead: `${previousTag.name}...${currentTag.name}`,
    });

    // if we have commits, please note what has changed
    if (commits.data && commits.data.total_commits > 0) {
      releaseNotes += `# What's Changed \n${commits.data.commits
        .map((c) => {
          console.log(c);
          return `- [${c.commit.message}](${c.html_url}) by ${c.committer.login}`;
        })
        .join("\n")}`;
    }
  }

  /**
   * Create a new release
   */

  const release = await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: tagname,
    name: tagname,
    body: releaseNotes,
    draft: false,
    prerelease: false,
    generate_release_notes: false,
  });

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
