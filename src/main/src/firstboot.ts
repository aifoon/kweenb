/**
 * This script will execute whenever the application starts
 * for the first time
 */

import * as path from "path";
import fs from "fs";
import { Utils } from "@shared/utils";
import { app } from "electron";
import { MAIN_PATH } from "./consts";
import settings from "./.firstboot/settings";
import { Setting } from "./models";

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
 * Return the path of the installed file
 * @returns
 */
const getInstalledFilePath = () =>
  process.env.NODE_ENV === "development"
    ? path.join(MAIN_PATH, "installed")
    : path.join(app.getPath("userData"), "installed");

/**
 * After the first boot
 */
const afterFirstBoot = () => {
  try {
    const installedFile = getInstalledFilePath();
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
  fs.existsSync(getInstalledFilePath());

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
