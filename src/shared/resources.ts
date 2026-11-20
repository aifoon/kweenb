import path from "path";
import { app } from "electron";

// Get the path that `extraResources` are sent to. This is `<app>/Resources`
// on macOS. remote.app.getAppPath() returns `<app>/Resources/app.asar` so
// we just get the parent directory. If the app is not packaged it is the
// folder `resources` of the project. That is found from where the app is,
// not from the current working directory: started as an app of its own
// (KWEENB_AS_APP) the working directory is the root of the disk.
export const resourcesPath = app.isPackaged
  ? path.dirname(app.getAppPath())
  : path.join(app.getAppPath(), "resources");
