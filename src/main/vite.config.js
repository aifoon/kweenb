import { builtinModules } from "module";
import { join, resolve } from "path";
import { node } from "../../.electron-vendors.cache.json";

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode: process.env.MODE,
  root: PACKAGE_ROOT,
  resolve: {
    alias: [
      {
        find: "@shared",
        replacement: resolve(__dirname, "../shared"),
      },
      {
        find: "@seeds",
        replacement: resolve(__dirname, "../seeds"),
      },
    ],
  },
  build: {
    sourcemap: "inline",
    target: `node${node}`,
    outDir: "dist",
    assetsDir: ".",
    minify: process.env.MODE !== "development",
    lib: {
      entry: "src/index.ts",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "electron",
        "electron-devtools-installer",
        "sequelize",
        "node:util",
        "node:buffer",
        "node:stream",
        "node:net",
        "node:url",
        "node:fs",
        "node:path",
        "node:http",
        "node:https",
        "node:zlib",
        "node:process",
        "node:stream/web",
        "node:child_process",
        "mqtt",
        "@zwerm3/jack",
        "node-osc",
        "mathjs",
        "tween-functions",
        "node-ssh",
        "ssh2-sftp-client",
        "express",
        "socket.io",
        ...builtinModules,
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
  rollupOptions: {
    warn: (warning) => {
      if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
      warn(warning.message);
    },
  },
};

export default config;
