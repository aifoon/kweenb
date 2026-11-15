/**
 * What has to go to the cloud and what has to come back: comparing the
 * backup folder on this computer with the bucket.
 *
 * Nothing in here needs Electron (or the internet), so it can be tested on
 * its own.
 */

// a file of the backup folder, by its path inside that folder with forward
// slashes (bee07/files/my_scene/audio.wav)
export interface LocalFile {
  key: string;
  sizeBytes: number;
  modified: Date;
}

export interface CloudFile {
  key: string;
  sizeBytes: number;
  modified: Date;
}

export interface CloudPlan {
  // the files to send or to get, the small ones first
  transfer: { key: string; sizeBytes: number }[];
  transferBytes: number;
  // the files that are the same on both sides
  same: number;
  // the files that are only on the other side (they are left alone)
  onlyThere: number;
}

/**
 * The name of a bee in a key (bee07), null for a key that is not of a bee
 */
export const beeOfKey = (key: string): string | null =>
  /^(bee\d+)\//.exec(key)?.[1] || null;

const plan = (
  from: { key: string; sizeBytes: number; modified: Date }[],
  to: { key: string; sizeBytes: number; modified: Date }[],
  bees: string[] | null,
  // true: a file that is newer on the from side is sent again
  newerWins: boolean
): CloudPlan => {
  const wanted = (key: string) => {
    const bee = beeOfKey(key);
    return bee !== null && (bees === null || bees.includes(bee));
  };
  const there = new Map(to.filter((f) => wanted(f.key)).map((f) => [f.key, f]));
  const transfer: { key: string; sizeBytes: number }[] = [];
  let same = 0;
  const here = from.filter((f) => wanted(f.key));
  here.forEach((file) => {
    const other = there.get(file.key);
    const differs =
      !other ||
      other.sizeBytes !== file.sizeBytes ||
      (newerWins && file.modified.getTime() > other.modified.getTime());
    if (differs) transfer.push({ key: file.key, sizeBytes: file.sizeBytes });
    else same += 1;
  });
  const hereKeys = new Set(here.map((f) => f.key));
  return {
    transfer: transfer.sort((a, b) => a.sizeBytes - b.sizeBytes),
    transferBytes: transfer.reduce((sum, f) => sum + f.sizeBytes, 0),
    same,
    onlyThere: [...there.keys()].filter((key) => !hereKeys.has(key)).length,
  };
};

/**
 * What has to be sent to the cloud: every file that is not there, has
 * another size, or was changed here after it was sent. Nothing is ever
 * removed from the cloud.
 * @param bees The bees to look at (bee07, ...), null for all
 */
export const planUpload = (
  local: LocalFile[],
  cloud: CloudFile[],
  bees: string[] | null = null
): CloudPlan => plan(local, cloud, bees, true);

/**
 * What has to be fetched from the cloud: every file that is not on this
 * computer or has another size here. A file that is here is not replaced by
 * an older copy from the cloud because of its date alone.
 * @param bees The bees to look at (bee07, ...), null for all
 */
export const planDownload = (
  cloud: CloudFile[],
  local: LocalFile[],
  bees: string[] | null = null
): CloudPlan => plan(cloud, local, bees, false);
