import { Installer } from "./Installer";
import fs from "fs";

export class JacktripInstaller extends Installer {
  constructor(version: string, targetPath: string) {
    super(
      version,
      "jacktrip",
      "jacktrip",
      /^JackTrip-v(\d+\.\d+\.\d+)-macOS-x64-application\.zip$/,
      targetPath
    );
  }

  /**
   * What to do after the installation
   */
  async afterInstall() {
    fs.readdirSync(this._targetPath).forEach((file) => {
      if (file !== "JackTrip.app") {
        fs.rmSync(this._targetPath + "/" + file, {
          recursive: true,
          force: true,
        });
      }
    });
  }
}
