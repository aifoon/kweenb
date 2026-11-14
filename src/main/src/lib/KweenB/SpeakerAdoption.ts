/**
 * Giving a new speaker its number. A freshly flashed speaker has no number:
 * it sits on an address the router gave it. With a number it renames itself
 * and moves to its fixed address.
 *
 * Nothing in here needs Electron, so it can be run on its own.
 */

import SpeakerApi, { SpeakerStatus } from "./SpeakerApi";

// how long a speaker gets to come back on its fixed address
const COME_BACK_TIMEOUT_MS = 60000;

// the pause between two looks at the fixed address
const COME_BACK_POLL_MS = 2000;

/**
 * Why a speaker could not get its number. The message is meant for the
 * user: what went wrong and what to try.
 */
export class SpeakerAdoptionError extends Error {
  // true when the speaker did get its number (but did not come back)
  public numberGiven: boolean;

  constructor(message: string, numberGiven: boolean = false) {
    super(message);
    this.name = "SpeakerAdoptionError";
    this.numberGiven = numberGiven;
  }
}

export interface GiveNumberOptions {
  // called when the speaker has its number and is on its way to its fixed address
  onWaiting?: () => void;
  comeBackTimeoutMs?: number;
}

/**
 * The fixed address of the bee with a number (bee 7: 192.168.50.107)
 * @param id The number of the bee
 * @param prefix The first three parts of the address
 * @param offset What is added to the number for the last part
 */
export const fixedAddressOfBee = (
  id: number,
  prefix: string,
  offset: number
): string => `${prefix}.${offset + id}`;

/**
 * Is this a number a speaker can get
 */
export const isValidBeeNumber = (id: number): boolean =>
  Number.isInteger(id) && id >= 1 && id <= 99;

/**
 * Give a new speaker its number and wait until it is back on its fixed address
 * @param ipAddress Where the speaker is now
 * @param id The number it gets (1 - 99)
 * @param fixedAddress Where it will be afterwards (see fixedAddressOfBee)
 * @param options
 * @returns The status of the speaker on its fixed address
 */
export const giveNumber = async (
  ipAddress: string,
  id: number,
  fixedAddress: string,
  options: GiveNumberOptions = {}
): Promise<SpeakerStatus> => {
  if (!isValidBeeNumber(id))
    throw new SpeakerAdoptionError("Choose a number from 1 to 99.");

  // the speaker must still be there, and still without a number
  let status: SpeakerStatus;
  try {
    status = await SpeakerApi.getStatus(ipAddress);
  } catch (e) {
    throw new SpeakerAdoptionError(
      "The new speaker does not answer any more. Check that it is still switched on, wait a moment and look for it again."
    );
  }
  if (status.identity?.id !== null && status.identity?.id !== undefined)
    throw new SpeakerAdoptionError(
      `This speaker already is bee ${status.identity.id}. Look for new speakers again.`
    );

  // nobody may be on the address the speaker moves to
  if (fixedAddress !== ipAddress) {
    let occupant: SpeakerStatus | null = null;
    try {
      occupant = await SpeakerApi.getStatus(fixedAddress);
    } catch (e) {
      // nobody there, as it should be
    }
    if (occupant)
      throw new SpeakerAdoptionError(
        occupant.identity?.id === id
          ? `Bee ${id} is already switched on. Two speakers cannot share a number. Choose another number, or switch off the other bee ${id} first.`
          : `Another speaker is using the place of bee ${id} right now. Choose another number.`
      );
  }

  try {
    await SpeakerApi.setIdentity(ipAddress, id);
  } catch (e: any) {
    throw new SpeakerAdoptionError(
      `The speaker did not take the number ${id}. Wait a moment and try again; if it keeps failing, switch the speaker off and on.`
    );
  }

  // about two seconds later the speaker moves to its fixed address
  if (options.onWaiting) options.onWaiting();
  const giveUpAt =
    Date.now() + (options.comeBackTimeoutMs || COME_BACK_TIMEOUT_MS);
  while (Date.now() < giveUpAt) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, COME_BACK_POLL_MS);
    });
    try {
      const newStatus = await SpeakerApi.getStatus(fixedAddress);
      if (newStatus.identity?.id === id) return newStatus;
    } catch (e) {
      // not there yet
    }
  }

  throw new SpeakerAdoptionError(
    `The speaker got the number ${id}, but it did not come back within a minute. Check that this computer is on the same network as the other speakers, then switch the speaker off and on again.`,
    true
  );
};

export default { fixedAddressOfBee, giveNumber, isValidBeeNumber };
