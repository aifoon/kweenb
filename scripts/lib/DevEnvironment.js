/**
 * A development environment
 */

const Environment = require("./Environment");

module.exports = class DevEnvironment extends Environment {
	constructor() {
		super((process.env.MODE = process.env.MODE || "development"));
	}

	async start() {
		// start the vite server with our renderer config
		await this.viteServer.start();

		// start building the preload resource
		await this.preloadBuilder.build();

		// start building the electron resources
		await this.mainBuilder.build();
	}
};
