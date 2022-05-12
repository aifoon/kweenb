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
  mode: process.env.MODE,
  base: "./",
  root: join(process.cwd(), "src", "renderer"),
  resolve: {
    alias: [
      {
        find: "@components",
        replacement: resolve(__dirname, "../../src/renderer/src/components"),
      },
      {
        find: "@renderer",
        replacement: resolve(__dirname, "../../src/renderer"),
      },
      {
        find: "@shared",
        replacement: resolve(__dirname, "../../src/shared"),
      },
    ],
  },
  server: {
    fs: {
      strict: true,
    },
  },
  optimizeDeps: {
    exclude: [],
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
