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
        replacement: resolve(__dirname, "../../src/shared"),
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
        "mqtt",
        "@zwerm3/jack",
        ...builtinModules,
      ],
      output: {
        entryFileNames: "[name].cjs",
      },
    },
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
