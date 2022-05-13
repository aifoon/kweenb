/**
 * This script will execute whenever the application starts
 * for the first time
 */

import path from "path";
import fs from "fs";
import { Utils } from "@shared/utils";
import { MAIN_PATH } from "./consts";
import settings from "./.firstboot/settings";
import Setting from "./models/Setting";

/**
 * Before the first boot (remove everything in case of reinstall)
 * @returns
 */
const beforeFirstBoot = async () => {
  try {
    await Setting.destroy({ where: {} });
  } catch (e: any) {
    console.error(`beforeFirstBoot(): ${e.message}`);
  }
};

/**
 * After the first boot
 */
const afterFirstBoot = () => {
  try {
    const installedFile = path.join(MAIN_PATH, "installed");
    console.log(installedFile);
    const d = new Date();
    fs.writeFileSync(
      installedFile,
      `${d.getUTCDate()}/${Utils.addLeadingZero(
        d.getUTCMonth() + 1
      )}/${d.getUTCFullYear()} ${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()} UTC`
    );
  } catch (e: any) {
    console.error(`afterFirstBoot(): ${e.message}`);
  }
};

/**
 * Checks if the application has booted for the first time
 * @returns boolean
 */
const hasBootedForTheFirstTime = (): boolean =>
  fs.existsSync(path.join(MAIN_PATH, "installed"));

/**
 * Seeding the default settings
 */
const seedSettings = async () => {
  try {
    await Setting.bulkCreate(settings);
  } catch (e: any) {
    console.error(`seedSettings(): ${e.message}`);
  }
};

/**
 * Export a firstBoot function
 */
export default async () => {
  // if we never booted the application for the first time
  if (!hasBootedForTheFirstTime()) {
    // before we start the first boot
    await beforeFirstBoot();

    // seed the settings
    await seedSettings();

    // after the first boot completed, write an install file
    afterFirstBoot();
  }
};
