/**
 * Some constants to control the library
 */

const path = require("path");

// The internal config folder
const configFolder = path.join(process.cwd(), "scripts", "config");

/**
 * The path to the main electron application config
 */
module.exports.mainConfigPath = path.join(configFolder, "vite.main.config.js");

/**
 * The path to the renderer application config
 */
module.exports.rendererConfigPath = path.join(
  configFolder,
  "vite.renderer.config.js"
);

/**
 * The path to the preload config
 */
module.exports.preloadConfigPath = path.join(
  configFolder,
  "vite.preload.config.js"
);
