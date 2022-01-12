import { builtinModules } from "module";
import { chrome } from "../../.electron-vendors.cache.json";

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
		target: `chrome${chrome}`,
		outDir: "../../src/preload/dist",
		assetsDir: ".",
		minify: process.env.MODE !== "development",
		lib: {
			entry: "../../src/preload/src/index.ts",
			formats: ["cjs"],
		},
		rollupOptions: {
			external: ["electron", ...builtinModules],
			output: {
				entryFileNames: "[name].cjs",
			},
		},
		emptyOutDir: true,
		brotliSize: false,
	},
};

export default config;
