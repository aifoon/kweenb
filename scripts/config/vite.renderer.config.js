/* eslint-env node */

import { join, resolve } from "path";
import { builtinModules } from "module";
import react from "vite-preset-react";

import { chrome } from "../../.electron-vendors.cache.json";

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  plugins: [react()],
  base: "./",
  root: join(process.cwd(), "src", "renderer"),
  mode: process.env.MODE,
  resolve: {
    alias: {
      "/@/": `${join(__dirname, "src")}/`,
    },
  },
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: resolve("./dist"),
    assetsDir: ".",
    rollupOptions: {
      external: [...builtinModules],
    },
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
