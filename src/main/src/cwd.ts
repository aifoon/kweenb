/**
 * KweenB in development finds its database and resources next to where it
 * was started. Started by the Mac itself (not from a terminal) that place is
 * "/", so the folder of the app is made the place to work from. This file
 * has to be the first import of the main process.
 */

import { app } from "electron";

if (!app.isPackaged) {
  try {
    process.chdir(app.getAppPath());
  } catch (e) {
    // stay where we are
  }
}
