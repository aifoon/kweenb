import { builtinModules } from "module";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { join, resolve } from "path";
import { chrome } from "../../.electron-vendors.cache.json";

const PACKAGE_ROOT = __dirname;

export default defineConfig({
  plugins: [react()],
  mode: process.env.MODE,
  base: "",
  root: PACKAGE_ROOT,
  resolve: {
    alias: [
      {
        find: "@components",
        replacement: resolve(PACKAGE_ROOT, "../components"),
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
  build: {
    sourcemap: true,
    outDir: "../main/public/webserver",
    assetsDir: ".",
    target: `chrome${chrome}`,
    rollupOptions: {
      input: join(PACKAGE_ROOT, "index.html"),
      external: [...builtinModules],
      onwarn(warning, warn) {
        // Suppress "Module level directives cause errors when bundled" warnings
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          warning.code === "SOURCEMAP_ERROR"
        ) {
          return;
        }
        warn(warning);
      },
    },
    emptyOutDir: true,
  },
  server: {
    port: 3001,
    fs: {
      strict: true,
    },
  },
});
