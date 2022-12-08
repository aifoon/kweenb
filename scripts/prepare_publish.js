const fs = require("fs");
const path = require("path");
const { exit } = require("process");
const { createLogger } = require("vite");

// create the logger
const logger = createLogger("info", { prefix: "[scripts]" });

// set the binary dir
const binDir = path.join(process.cwd(), "bin");

// check if dir exists
if (!fs.existsSync(binDir)) return;

// log
logger.info("Removing existing binaries...");

// read all files in the directory
const files = fs.readdirSync(binDir);

// remove every file
files.forEach((f) =>
  fs.rmSync(`${binDir}/${f}`, { recursive: true, force: true })
);
