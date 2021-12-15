const { createServer } = require("vite");
const chalk = require("chalk");
const LoggerPlugin = require("../plugins/LoggerPlugin");

/**
 * A class that can start/stop a vite server
 */
module.exports = class ViteServer {
  constructor(config) {
    this.config = config;
    this.internalServer = null;
  }

  /**
   * Starts the vite server
   * @returns
   */
  async start() {
    this.internalServer = await createServer({
      ...this.config,
      plugins: [LoggerPlugin("[kweenb-vite]")],
    });

    // start listening
    await this.internalServer.listen();

    // get the address on which the vite server is running
    const address = this.internalServer.httpServer?.address();

    // validate if we have data, if yes, output this to the console
    if (typeof address === "object") {
      // eslint-disable-next-line no-console
      console.log(
        chalk.green("[vite]"),
        chalk.green(`Development server running at: localhost:${address.port}`)
      );
    }
  }

  /**
   * Closes the vite server
   */
  async close() {
    if (this.internalServer) {
      await this.internalServer?.close();
    }
  }
};
