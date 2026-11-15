import { useEffect, useState } from "react";
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
  window.kweenb.actions.followBeeLevels(owner, beeIds);
};

/**
 * The live level of a bee in dB below full scale; null as long as the bee
 * does not tell it
 */
export const useLiveLevel = (beeId: number): number | null => {
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    listen();
    const read = () => {
      const told = levels.get(beeId);
      setLevel(told && Date.now() - told.time < STALE_MS ? told.levelDb : null);
    };
    read();
    const ofBee = listeners.get(beeId) || new Set<() => void>();
    listeners.set(beeId, ofBee);
    ofBee.add(read);
    // a bee that stopped telling loses its meter
    const watch = setInterval(read, 500);
    return () => {
      clearInterval(watch);
      ofBee.delete(read);
    };
  }, [beeId]);

  return level;
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
