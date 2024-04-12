const { version } = require("./package.json");
require("dotenv").config();

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: "be.aifoon.kweenb",
  productName: "kweenb",
  asarUnpack: ["node_modules/sqlite3"],
  copyright: "aifoon vzw",
  // afterSign: "scripts/notarize.js",
  artifactName: "${name}-${version}-${os}-${arch}.${ext}",
  directories: {
    output: "bin",
  },
  extraResources: [
    {
      from: "resources",
      to: ".",
      filter: "**/*",
    },
  ],
  mac: {
    asar: true,
    hardenedRuntime: true,
    entitlements: "./src/.config/entitlements.mac.plist",
    entitlementsInherit: "./src/.config/entitlements.mac.plist",
    gatekeeperAssess: false,
    target: {
      target: "dmg",
      arch: ["arm64"],
    },
  },
  dmg: {
    sign: false,
  },
  linux: {
    asar: true,
    category: "Utility",
    maintainer: "aifoon",
    vendor: "aifoon",
    target: {
      target: "deb",
      arch: ["x64", "arm64", "armv7l"],
    },
  },
  files: ["./kweenb.key", "buildResources/**/*", "src/**/dist/**"],
  extraMetadata: {
    version,
  },
};

module.exports = config;
