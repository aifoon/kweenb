/**
 * The fingerprint of a composition: its name, and per bee the scene and
 * whether it loops. Two compositions with the same fingerprint are the same.
 *
 * KweenB and the satellite compare fingerprints to see what changed where,
 * so this function has to stay IDENTICAL in both:
 *   kweenb     src/main/src/lib/Satellite/CompositionHash.ts
 *   kweenb-pi  src/backend/lib/Sync/CompositionHash.ts
 */

import { createHash } from "crypto";

export interface CompositionItem {
  beeId: number;
  // a scene is the same scene on every bee that has this folder
  localFolderPath: string;
  isLooping: boolean;
}

export const compositionHash = (
  name: string,
  items: CompositionItem[]
): string =>
  createHash("sha1")
    .update(
      JSON.stringify([
        name,
        items
          .map((item): [number, string, boolean] => [
            Number(item.beeId),
            item.localFolderPath,
            Boolean(item.isLooping),
          ])
          .sort((a, b) => a[0] - b[0]),
      ])
    )
    .digest("hex");
