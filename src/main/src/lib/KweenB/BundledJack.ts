/**
 * Choosing the Jack that KweenB works with: its own, which travels inside
 * the app, or another one that was chosen in the settings.
 */

import { Zwerm3Jack } from "@zwerm3/jack";
import { join } from "path";
import { BUNDLED_JACK_FOLDER, BUNDLED_JACKTRIP_BIN } from "../../consts";

// Only the macOS version of KweenB carries Jack and JackTrip. Elsewhere
// the ones of the system are used, as @zwerm3/jack finds them by itself.
export const HAS_BUNDLED_JACK = process.platform === "darwin";

/**
 * The Jack folder to work with
 * @param chosen the folder from the settings, empty when none was chosen
 * @returns the folder, or empty for "the one of the system"
 */
export const jackFolderFor = (chosen: string): string =>
  chosen || (HAS_BUNDLED_JACK ? BUNDLED_JACK_FOLDER : "");

/**
 * The JackTrip program to work with
 * @param chosen the program from the settings, empty when none was chosen
 * @returns the program, or empty for "the one of the system"
 */
export const jacktripBinFor = (chosen: string): string =>
  chosen || (HAS_BUNDLED_JACK ? BUNDLED_JACKTRIP_BIN : "");

/**
 * Work with the Jack programs in this folder
 * @param jackFolderPath the folder that holds jackd, jack_lsp, ...
 */
export const useJackFolder = (jackFolderPath: string) => {
  Zwerm3Jack.default.jackFolderPath = jackFolderPath;

  // KweenB's own Jack has its libraries and drivers next to it. Jack finds
  // its drivers, and JackTrip finds Jack, through these two settings. With
  // another Jack they must not point here: that one brings its own.
  if (HAS_BUNDLED_JACK && jackFolderPath === BUNDLED_JACK_FOLDER) {
    process.env.JACK_DRIVER_DIR = join(BUNDLED_JACK_FOLDER, "lib", "jack");
    process.env.DYLD_LIBRARY_PATH = join(BUNDLED_JACK_FOLDER, "lib");
  } else {
    delete process.env.JACK_DRIVER_DIR;
    delete process.env.DYLD_LIBRARY_PATH;
  }
};
