import { builtinModules } from "module";
import { node } from "../../.electron-vendors.cache.json";

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
	mode: process.env.MODE,
	root: __dirname,
	envDir: process.cwd(),
	build: {
		sourcemap: "inline",
		target: `node${node}`,
		outDir: "../../dist",
		assetsDir: ".",
		minify: process.env.MODE !== "development",
		lib: {
			entry: "../../src/main/src/index.ts",
			formats: ["cjs"],
		},
		rollupOptions: {
			external: ["electron", "electron-devtools-installer", ...builtinModules],
			output: {
				entryFileNames: "[name].cjs",
			},
		},
		emptyOutDir: true,
		brotliSize: false,
	},
};

export default config;
