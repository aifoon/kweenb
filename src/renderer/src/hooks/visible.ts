/**
 * Doing work only while someone can see it. KweenB often sits behind the
 * audio software for a whole show: what it does not draw then, the computer
 * can spend on the sound.
 */

/**
 * Do something every so often, but only while the window can be seen. When
 * the window comes back it is done right away.
 * @returns A function that stops it
 */
export const visibleInterval = (
  task: () => void,
  everyMs: number
): (() => void) => {
  let timer: number | null = null;
  const start = () => {
    if (timer === null) timer = window.setInterval(task, everyMs);
  };
  const stop = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
  const onVisibility = () => {
    if (document.hidden) stop();
    else {
      task();
      start();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  if (!document.hidden) start();
  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    stop();
  };
};

/**
 * A fresh list in which every item that did not change is the object of the
 * list before. A part of the screen that shows one item is then only drawn
 * again when that item changed. Gives the list before itself when nothing
 * changed at all.
 */
export const keepUnchanged = <T extends { id: number }>(
  before: T[],
  fresh: T[]
): T[] => {
  const known = new Map(
    before.map((item) => [item.id, { item, text: JSON.stringify(item) }])
  );
  let changed = before.length !== fresh.length;
  const list = fresh.map((item, index) => {
    const same = known.get(item.id);
    if (same && same.text === JSON.stringify(item)) {
      if (before[index] !== same.item) changed = true;
      return same.item;
    }
    changed = true;
    return item;
  });
  return changed ? list : before;
};
