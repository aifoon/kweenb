/**
 * A production environment
 */

const Environment = require("./Environment");

module.exports = class ProdEnvironment extends Environment {
  constructor() {
    super((process.env.MODE = process.env.MODE || "production"));
    this.initPreload();
  }

  /**
   * Start the production build
   */
  async start() {
    try {
      const timeLabel = "Bundling time";
      const totalTimeLabel = "Total bundling time";
      console.time(totalTimeLabel);

      // start building the react application
      console.group("renderer");
      console.time(timeLabel);
      await this.rendererBuilder.build();
      console.timeEnd(timeLabel);
      console.groupEnd("renderer");
      console.log("\n"); // Just for pretty print

      // start building the electron resources
      console.group("main");
      console.time(timeLabel);
      await this.mainBuilder.build();
      console.timeEnd(timeLabel);
      console.groupEnd("main");
      console.log("\n"); // Just for pretty print

      // start the preloadbuilder
      console.group("preload");
      console.time(timeLabel);
      await this.preloadBuilder.build();
      console.timeEnd(timeLabel);
      console.groupEnd("preload");
      console.log("\n"); // Just for pretty print

      console.timeEnd(totalTimeLabel);
    } catch (error) {
      console.error(error.message);
    }
  }
};
