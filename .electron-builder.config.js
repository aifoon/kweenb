const { version } = require("./package.json");

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "com.kweenb.app",
  productName: "kweenb",
  copyright: "Copyright © 2022 aifoon vzw.",
  buildVersion: version,
  directories: {
    output: "bin",
    buildResources: "buildResources",
  },
  mac: {
    target: {
      target: "dmg",
      arch: ["x64", "arm64"],
    },
  },
  linux: {
    target: ["AppImage", "deb"],
    category: "Utility",
    maintainer: "aifoon",
    vendor: "aifoon",
  },
  files: ["src/**/dist/**"],
  extraMetadata: {
    version,
  },
};

module.exports = config;
