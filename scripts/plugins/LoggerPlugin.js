/**
 * A plugin to log something to the console
 */

const path = require("path");
const chalk = require("chalk");

module.exports = function LoggerPlugin(prefix) {
	return {
		name: "electron-scripts-logger",
		handleHotUpdate: ctx => {
			ctx.modules.forEach(file => {
				// eslint-disable-next-line no-console
				console.log(
					chalk.yellow(prefix),
					chalk.yellow("Update"),
					chalk.grey(file.file?.replace(path.join(process.cwd(), "./src"), ""))
				);
			});
			return ctx.modules;
		},
	};
};
