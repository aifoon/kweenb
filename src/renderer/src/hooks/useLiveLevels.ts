import { create } from "zustand";

/**
 * Live meters: the level of the sound that leaves a bee, about ten times a
 * second. Every level is a packet on the Wi-Fi, so bees are only followed
 * while someone looks at their meter.
 */

// a level that is older than this is no longer shown
const STALE_MS = 1500;

const levels = new Map<number, { levelDb: number; time: number }>();
const listeners = new Map<number, Set<() => void>>();
let listening = false;

const listen = () => {
  if (listening) return;
  listening = true;
  window.kweenb.events.onBeeLevels((event, told) => {
    const now = Date.now();
    Object.entries(told).forEach(([id, levelDb]) => {
      const beeId = Number(id);
      levels.set(beeId, { levelDb, time: now });
      listeners.get(beeId)?.forEach((listener) => listener());
    });
  });
};

/**
 * Tell which bees a part of KweenB wants the live level of
 * @param owner The part of KweenB that asks
 * @param beeIds Its bees; an empty list when it wants none any more
 */
export const followLiveLevels = (
  owner: "dashboard" | "swarm",
  beeIds: number[]
) => {
  listen();
  wanted.set(owner, beeIds);
  if (!document.hidden) window.kweenb.actions.followBeeLevels(owner, beeIds);
};

// every level is a packet on the Wi-Fi: none are asked for while KweenB is
// out of sight
const wanted = new Map<"dashboard" | "swarm", number[]>();
document.addEventListener("visibilitychange", () => {
  wanted.forEach((beeIds, owner) => {
    if (beeIds.length > 0)
      window.kweenb.actions.followBeeLevels(
        owner,
        document.hidden ? [] : beeIds
      );
  });
});

/**
 * The live level of a bee right now, in dB below full scale; null as long
 * as the bee does not tell it
 */
export const readLiveLevel = (beeId: number): number | null => {
  const told = levels.get(beeId);
  return told && Date.now() - told.time < STALE_MS ? told.levelDb : null;
};

/**
 * Be called whenever a bee tells its level. The levels come ten times a
 * second per bee: a meter writes them straight to the screen instead of
 * drawing its part of the page again.
 * @returns A function that stops it
 */
export const onLiveLevel = (beeId: number, listener: () => void) => {
  listen();
  const ofBee = listeners.get(beeId) || new Set<() => void>();
  listeners.set(beeId, ofBee);
  ofBee.add(listener);
  return () => {
    ofBee.delete(listener);
  };
};

/**
 * Are the live meters on the Swarm page switched on. They are off when
 * KweenB starts: they are meant for a check before the show.
 */
export const useLiveMetersSwitch = create<{
  on: boolean;
  set: (on: boolean) => void;
}>((set) => ({
  on: false,
  set: (on) => set({ on }),
}));
