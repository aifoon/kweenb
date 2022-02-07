/**
 * A builder for our files
 */

const { build } = require("vite");

module.exports = class Builder {
  constructor(name, config, writeBundle = () => {}) {
    this.name = name;
    this.config = config;
    this.writeBundle = writeBundle;
  }

  /**
   * Build the code, based on the main path
   */
  async build() {
    // starting the build
    await build({
      ...this.config,
      plugins: [
        {
          name: this.name,
          writeBundle: this.writeBundle,
        },
      ],
    });
  }
};
