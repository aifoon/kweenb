const { version } = require("./package.json");
require("dotenv").config();

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "be.aifoon.kweenb",
  productName: "kweenb",
  asar: true,
  asarUnpack: ["node_modules/sqlite3"],
  copyright: "aifoon vzw",
  afterSign: "scripts/notarize.js",
  directories: {
    output: "bin",
    buildResources: "buildResources",
  },
  mac: {
    hardenedRuntime: true,
    entitlements: ".config/entitlements.mac.plist",
    entitlementsInherit: ".config/entitlements.mac.plist",
    gatekeeperAssess: false,
    target: {
      target: "dmg",
      arch: ["x64", "arm64"],
    },
  },
  dmg: {
    sign: false,
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
