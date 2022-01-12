/**
 * Starts the development environment
 */

const DevEnvironment = require("./lib/DevEnvironment");

async function main() {
	// create a new dev environment
	const devEnvironment = new DevEnvironment();

	// start the dev environment
	await devEnvironment.start();
}

main();
