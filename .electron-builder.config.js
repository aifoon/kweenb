if (process.env.VITE_APP_VERSION === undefined) {
	const now = new Date();
	process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${
		now.getUTCMonth() + 1
	}.${now.getUTCDate()}-${now.getUTCHours() * 60 + now.getUTCMinutes()}`;
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
	appId: "com.kweenb.app",
	productName: "kweenb",
	copyright: "Copyright © 2022 aifoon vzw.",
	directories: {
		output: "bin",
	},
	files: ["./dist/**/*"],
	dmg: {
		background: null,
		backgroundColor: "#ffffff",
		window: {
			width: "400",
			height: "300",
		},
		contents: [
			{
				x: 100,
				y: 100,
			},
			{
				x: 300,
				y: 100,
				type: "link",
				path: "/Applications",
			},
		],
	},
	mac: {
		target: "dmg",
		category: "public.app-category.music",
	},
	extraMetadata: {
		version: process.env.VITE_APP_VERSION,
	},
};

module.exports = config;
