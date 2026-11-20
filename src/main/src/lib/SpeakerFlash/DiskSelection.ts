/**
 * Which disk is the storage of the speaker that was just connected. Writing
 * an image erases a disk, so a disk is only chosen when everything about it
 * fits; in doubt nothing is chosen.
 *
 * Nothing in here needs Electron (or runs anything), so it can be tested on
 * its own with made up data.
 */

// the storage of a speaker is about 31 GB; anything outside of this is not it
export const MIN_STORAGE_BYTES = 6 * 1000 * 1000 * 1000;
export const MAX_STORAGE_BYTES = 70 * 1000 * 1000 * 1000;

// a whole disk (disk4), never a part of one (disk4s1)
const WHOLE_DISK_ID = /^disk[0-9]+$/;

export type PlistValue =
  | string
  | number
  | boolean
  | PlistValue[]
  | { [key: string]: PlistValue };

// what we need to know about a disk, taken from `diskutil info -plist`
export interface DiskInfo {
  // e.g. disk4
  id: string;
  wholeDisk: boolean;
  // null when the computer does not tell
  internal: boolean | null;
  external: boolean;
  physical: boolean;
  diskImage: boolean;
  // how the disk is connected (e.g. USB)
  busProtocol: string;
  sizeBytes: number;
  mediaName: string;
}

export type DiskSelection =
  | { disk: DiskInfo }
  // none: no new disk fits; several: more than one could be it
  | { disk: null; reason: "none" | "several" };

/**
 * Is this the name of a whole disk
 */
export const isWholeDiskId = (id: unknown): id is string =>
  typeof id === "string" && WHOLE_DISK_ID.test(id);

/**
 * Read the XML property list `diskutil ... -plist` prints
 * @param xml The output of diskutil
 */
export const parsePlist = (xml: string): PlistValue => {
  const tag = /<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g;

  interface Tag {
    name: string;
    closing: boolean;
    selfClosing: boolean;
    start: number;
    end: number;
  }

  const next = (): Tag => {
    const match = tag.exec(xml);
    if (!match) throw new Error("The property list ends too early.");
    return {
      name: match[2],
      closing: match[1] === "/",
      selfClosing: match[3] === "/",
      start: match.index,
      end: tag.lastIndex,
    };
  };

  const decode = (text: string) =>
    text
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16))
      )
      .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");

  // the text between an opening tag and its closing tag
  const textOf = (open: Tag): string => {
    if (open.selfClosing) return "";
    const close = next();
    if (!close.closing || close.name !== open.name)
      throw new Error(`The property list has an unfinished <${open.name}>.`);
    return decode(xml.slice(open.end, close.start));
  };

  const valueOf = (open: Tag): PlistValue => {
    if (open.closing)
      throw new Error(`The property list has a stray </${open.name}>.`);
    switch (open.name) {
      case "dict": {
        const dict: { [key: string]: PlistValue } = {};
        if (open.selfClosing) return dict;
        for (;;) {
          const key = next();
          if (key.closing && key.name === "dict") return dict;
          if (key.closing || key.name !== "key")
            throw new Error("The property list has a value without a key.");
          const name = textOf(key);
          const value = valueOf(next());
          if (name !== "__proto__") dict[name] = value;
        }
      }
      case "array": {
        const array: PlistValue[] = [];
        if (open.selfClosing) return array;
        for (;;) {
          const item = next();
          if (item.closing && item.name === "array") return array;
          array.push(valueOf(item));
        }
      }
      case "string":
      case "date":
      case "data":
        return textOf(open);
      case "integer":
      case "real":
        return Number(textOf(open));
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new Error(`The property list has an unknown <${open.name}>.`);
    }
  };

  let first = next();
  if (first.name === "plist") first = next();
  return valueOf(first);
};

/**
 * What we need to know about a disk
 * @param info The parsed output of `diskutil info -plist <disk>`
 * @returns null when this is not the description of a disk
 */
export const diskInfoOf = (info: PlistValue): DiskInfo | null => {
  if (typeof info !== "object" || Array.isArray(info)) return null;
  if (typeof info.DeviceIdentifier !== "string") return null;

  const text = (key: string) =>
    typeof info[key] === "string" ? (info[key] as string) : "";
  const size = typeof info.TotalSize === "number" ? info.TotalSize : info.Size;
  const busProtocol = text("BusProtocol");

  return {
    id: info.DeviceIdentifier,
    // a part of a disk names another disk as its whole disk
    wholeDisk:
      info.WholeDisk === true &&
      (info.ParentWholeDisk === undefined ||
        info.ParentWholeDisk === info.DeviceIdentifier),
    internal:
      typeof info.Internal === "boolean"
        ? info.Internal || info.OSInternalMedia === true
        : null,
    external: info.RemovableMediaOrExternalDevice === true,
    physical: info.VirtualOrPhysical === "Physical",
    diskImage: /disk image/i.test(busProtocol) || info.SystemImage === true,
    busProtocol,
    sizeBytes: typeof size === "number" && Number.isFinite(size) ? size : 0,
    mediaName: text("MediaName") || text("IORegistryEntryName"),
  };
};

/**
 * Could this disk be the storage of a speaker. Everything has to fit.
 * @param disk
 */
export const couldBeSpeakerStorage = (disk: DiskInfo): boolean =>
  isWholeDiskId(disk.id) &&
  disk.wholeDisk &&
  // the computer has to say that it is not one of its own disks
  disk.internal === false &&
  disk.external &&
  disk.physical &&
  !disk.diskImage &&
  // a speaker is connected with a USB cable
  disk.busProtocol === "USB" &&
  disk.sizeBytes >= MIN_STORAGE_BYTES &&
  disk.sizeBytes <= MAX_STORAGE_BYTES;

/**
 * Choose the storage of the speaker out of the disks that are connected
 * @param diskIdsBefore Every disk that was there before we looked for the speaker
 * @param disksNow The external disks that are there now
 */
export const selectSpeakerStorage = (
  diskIdsBefore: string[],
  disksNow: DiskInfo[]
): DiskSelection => {
  // a disk that was already there is never the speaker
  const newDisks = disksNow.filter(
    (disk) => isWholeDiskId(disk.id) && !diskIdsBefore.includes(disk.id)
  );
  const candidates = newDisks.filter(couldBeSpeakerStorage);

  if (candidates.length === 0) return { disk: null, reason: "none" };
  if (candidates.length > 1) return { disk: null, reason: "several" };

  // a disk that does not carry the name of a speaker is only trusted when
  // it is the only thing that showed up
  const [disk] = candidates;
  const namedAsSpeaker = /rpi/i.test(disk.mediaName);
  if (disk.mediaName && !namedAsSpeaker && newDisks.length !== 1)
    return { disk: null, reason: "several" };

  return { disk };
};

// an SD card for a satellite: 8 GB (which is a bit less in bytes) or more.
// The upper limit keeps backup disks and other large disks out.
export const MIN_CARD_BYTES = 7 * 1000 * 1000 * 1000;
export const MAX_CARD_BYTES = 300 * 1000 * 1000 * 1000;

/**
 * Could this disk be the SD card for a satellite: a card in the card reader
 * of the computer, or in a reader on a USB port. Everything has to fit.
 * @param disk
 */
export const couldBeSatelliteCard = (disk: DiskInfo): boolean =>
  isWholeDiskId(disk.id) &&
  disk.wholeDisk &&
  // something that can be taken out or unplugged
  disk.external &&
  disk.physical &&
  !disk.diskImage &&
  // the built-in card reader, or a reader on USB that the computer does not
  // count as one of its own disks
  (/^secure digital$/i.test(disk.busProtocol) ||
    (disk.busProtocol === "USB" && disk.internal === false)) &&
  disk.sizeBytes >= MIN_CARD_BYTES &&
  disk.sizeBytes <= MAX_CARD_BYTES;

/**
 * A card that sits in the card reader that is built into the computer.
 * Nothing but an SD card fits in there, so such a card may be used when it
 * was already in. (A disk on USB that was already there is never used: that
 * could be a stick or a disk with something else on it.)
 * @param disks The disks that are there now
 * @returns The card, null when there is none or more than one
 */
export const cardInBuiltInReader = (disks: DiskInfo[]): DiskInfo | null => {
  const cards = disks.filter(
    (disk) =>
      couldBeSatelliteCard(disk) && /^secure digital$/i.test(disk.busProtocol)
  );
  return cards.length === 1 ? cards[0] : null;
};

export type CardSelection =
  | { disk: DiskInfo }
  // none: nothing new; several: more than one new disk;
  // unfit: one new disk, but not a card KweenB will write to
  | { disk: null; reason: "none" | "several" }
  | { disk: null; reason: "unfit"; unfit: DiskInfo };

/**
 * Choose the SD card out of the disks that are connected: the one disk that
 * was put in after we started looking. A disk that was already there is
 * never chosen, so a card has to be put in while KweenB watches.
 * @param diskIdsBefore Every disk that was there before we looked for the card
 * @param disksNow The disks that are there now
 */
export const selectSatelliteCard = (
  diskIdsBefore: string[],
  disksNow: DiskInfo[]
): CardSelection => {
  const newDisks = disksNow.filter(
    (disk) =>
      isWholeDiskId(disk.id) &&
      disk.wholeDisk &&
      !diskIdsBefore.includes(disk.id)
  );
  if (newDisks.length === 0) return { disk: null, reason: "none" };
  // never guess between two things that showed up
  if (newDisks.length > 1) return { disk: null, reason: "several" };
  const [disk] = newDisks;
  return couldBeSatelliteCard(disk)
    ? { disk }
    : { disk: null, reason: "unfit", unfit: disk };
};

/**
 * Is a disk still the one that was chosen (looked at again right before it
 * is erased: in the meantime another disk can have taken its name)
 * @param chosen The disk that was chosen
 * @param now What the disk with that name is now, null when it is gone
 * @param fits What the disk has to be: the storage of a speaker, or a card
 */
export const isStillTheSameDisk = (
  chosen: DiskInfo,
  now: DiskInfo | null,
  fits: (disk: DiskInfo) => boolean = couldBeSpeakerStorage
): boolean =>
  !!now &&
  fits(now) &&
  now.id === chosen.id &&
  now.sizeBytes === chosen.sizeBytes &&
  now.mediaName === chosen.mediaName;
