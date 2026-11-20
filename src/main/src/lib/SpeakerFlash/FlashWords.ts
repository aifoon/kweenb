/**
 * What KweenB says while flashing. A speaker is flashed over a USB cable, a
 * satellite through its SD card in the card reader of this computer, so the
 * words differ.
 */

import { FlashKind } from "@shared/interfaces";

export type { FlashKind };

export interface FlashWords {
  stoppedPartly: string;
  stoppedNothing: string;
  // comes behind what is wrong with the image
  afterImageProblem: string;
  notTaken: string;
  changed: string;
  inUse: string;
  notAllowedToOpen: string;
  writeFailed: string;
  noPassword: string;
  noRights: string;
  halfway: string;
  imageTooLarge: string;
}

const SPEAKER: FlashWords = {
  stoppedPartly:
    "Stopped. The speaker is only partly written: flash it again before you use it.",
  stoppedNothing: "Stopped. Nothing was changed on the speaker.",
  afterImageProblem: "The speaker has to be flashed again before you use it.",
  notTaken:
    "The speaker's storage did not take the image correctly. Try again; if it keeps happening the storage of this speaker may be worn out.",
  changed:
    "The speaker is no longer connected the way it was, so nothing was written. Switch the speaker off and on, and start again.",
  inUse:
    "The speaker's storage is in use by another app, so nothing was written. Close apps that may be using it (Raspberry Pi Imager for example) and try again.",
  notAllowedToOpen:
    "The Mac did not let KweenB open the speaker's storage, so nothing was written. Try again and give your password when the Mac asks for it.",
  writeFailed:
    "The image could not be written to the speaker. Check that the image is not larger than the speaker's storage and that the USB cable sits tight, then flash it again.",
  noPassword:
    "Without your password KweenB is not allowed to write to the speaker. Nothing was changed on it.",
  noRights:
    "KweenB was not allowed to write to the speaker. Nothing was changed on it. Try again and give the password of an administrator of this computer.",
  halfway:
    "Writing the image stopped halfway. Check the USB cable and flash the speaker again.",
  imageTooLarge:
    "This image is larger than the speaker's storage. Choose the image that was made for these speakers.",
};

const SATELLITE: FlashWords = {
  stoppedPartly:
    "Stopped. The card is only partly written: flash it again before you use it.",
  stoppedNothing: "Stopped. Nothing was changed on the card.",
  afterImageProblem: "The card has to be flashed again before you use it.",
  notTaken:
    "The card did not take the image correctly. Try again; if it keeps happening the card may be worn out: use another one.",
  changed:
    "The card is no longer in the reader the way it was, so nothing was written. Take it out and start again.",
  inUse:
    "The card is in use by another app, so nothing was written. Close apps that may be using it (Raspberry Pi Imager for example) and try again.",
  notAllowedToOpen:
    "The Mac did not let KweenB open the card, so nothing was written. Try again and give your password when the Mac asks for it.",
  writeFailed:
    "The image could not be written to the card. Check that the card is not locked (the small switch on its side) and that it is 8 GB or more, then flash it again.",
  noPassword:
    "Without your password KweenB is not allowed to write to the card. Nothing was changed on it.",
  noRights:
    "KweenB was not allowed to write to the card. Nothing was changed on it. Try again and give the password of an administrator of this computer.",
  halfway:
    "Writing the image stopped halfway. Check that the card sits tight in the reader and flash it again.",
  imageTooLarge:
    "This image is larger than the card. Use a card of 8 GB or more.",
};

export const flashWordsFor = (kind: FlashKind): FlashWords =>
  kind === "satellite" ? SATELLITE : SPEAKER;
