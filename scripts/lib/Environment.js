/**
 * A development environment
 */

const electronPath = require("electron");
const {
	rendererConfigPath,
	mainConfigPath,
	preloadConfigPath,
} = require("./consts");
const ViteServer = require("./ViteServer");
const Builder = require("./Builder");
const Electron = require("./Electron");

module.exports = class Environment {
	constructor(mode) {
		// set the mode globally
		this.mode = mode;

		// the configuration file
		this.config = {
			mode,
			build: {
				watch: {},
			},
			logLevel: "info",
		};

		// init the preload
		this.initPreload();

		// init vite server
		this.initViteServer();

		// init renderer
		this.initRenderer();

		// init the electron runner
		this.electron = new Electron();

		// define the main process
		this.initMain();
	}

	/**
	 * Init the Vite Server
	 */
	initViteServer() {
		// define the vite server
		this.viteServer = new ViteServer({
			...this.config,
			configFile: rendererConfigPath,
		});
	}

	/**
	 * Init the renderer
	 */
	initRenderer() {
		this.rendererBuilder = new Builder("renderer-builder", {
			...this.config,
			configFile: rendererConfigPath,
		});
	}

	/**
	 * Define the Main Process
	 */
	initMain() {
		this.mainBuilder = new Builder(
			"main-builder",
			{
				...this.config,
				configFile: mainConfigPath,
			},
			() => {
				if (this.mode === "production") return;
				this.electron.start(electronPath, () => {
					this.viteServer.close();
				});
			}
		);
	}

	/**
	 * Init the preload builder
	 */
	initPreload() {
		this.preloadBuilder = new Builder(
			"preload-builder",
			{
				...this.config,
				configFile: preloadConfigPath,
			},
			() => {
				if (this.mode === "production") return;
				this.viteServer.internalServer.ws.send({
					type: "full-reload",
				});
			}
		);
	}
};
