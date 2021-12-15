/* eslint-disable class-methods-use-this */
const { spawn } = require("child_process");
const stream = require("stream");
const chalk = require("chalk");

module.exports = class Electron {
  electronProcess = null;

  exitByScripts = false;

  /**
   * Electron process options, that will remove junk out of the electron stdout
   */
  removeJunkTransformOptions = {
    decodeStrings: false,
    transform: (chunk, encoding, done) => {
      const source = chunk.toString();
      // Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770>
      if (
        /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+] /.test(
          source
        )
      ) {
        return false;
      }
      // Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105)
      if (/\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/.test(source)) {
        return false;
      }
      // Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0'
      if (/ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/.test(source)) {
        return false;
      }
      done(null, chunk);
      return true;
    },
  };

  /**
   * A delay function
   */
  async delay(duration) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * Starts the electron process
   */
  async start(path, onClose = () => {}) {
    // if we already have an electron process running, kill it
    if (this.electronProcess) {
      if (this.electronProcess.pid) process.kill(this.electronProcess.pid);
      this.exitByScripts = true;
      this.electronProcess = null;
      await this.delay(500);
    }

    // start the electron process
    // eslint-disable-next-line require-atomic-updates
    this.electronProcess = spawn(String(path), ["."]);

    // when the electron process exits
    this.electronProcess?.on("exit", async (code) => {
      if (!this.exitByScripts) {
        console.log(chalk.gray(`Electron exited with code ${code}`));
        // do something in post
        await onClose();
        // close the whole process
        process.exit();
      }
      // eslint-disable-next-line require-atomic-updates
      this.exitByScripts = true;
    });

    // remove junk out of output stream
    const removeElectronLoggerJunkOut = new stream.Transform(
      this.removeJunkTransformOptions
    );

    // remove junk out of error stream
    const removeElectronLoggerJunkErr = new stream.Transform(
      this.removeJunkTransformOptions
    );

    // pipes to output
    this.electronProcess?.stdout
      ?.pipe(removeElectronLoggerJunkOut)
      ?.pipe(process.stdout);
    this.electronProcess?.stderr
      ?.pipe(removeElectronLoggerJunkErr)
      ?.pipe(process.stderr);
  }
};
