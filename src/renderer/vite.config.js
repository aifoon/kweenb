import { join, resolve } from "path";
import { builtinModules } from "module";
import react from "@vitejs/plugin-react";
import { chrome } from "../../.electron-vendors.cache.json";

const PACKAGE_ROOT = __dirname;

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  plugins: [react()],
  mode: process.env.MODE,
  base: "",
  root: PACKAGE_ROOT,
  resolve: {
    alias: [
      {
        find: "@components",
        replacement: resolve(PACKAGE_ROOT, "src/components"),
      },
      {
        find: "@renderer",
        replacement: resolve(PACKAGE_ROOT),
      },
      {
        find: "@shared",
        replacement: resolve(PACKAGE_ROOT, "../shared"),
      },
    ],
  },
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    target: `chrome${chrome}`,
    outDir: "dist",
    assetsDir: ".",
    rollupOptions: {
      input: join(PACKAGE_ROOT, "index.html"),
      external: [...builtinModules],
    },
    chunkSizeWarningLimit: 5000,
    emptyOutDir: true,
    brotliSize: false,
  },
};

export default config;
