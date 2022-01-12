/**
 * Register different action endpoints
 */

import { ipcMain } from "electron";
import { hello } from "./actions";

export default () => {
	ipcMain.on("hello", hello);
};
