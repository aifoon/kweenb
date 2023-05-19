import { useEffect, useLayoutEffect, useRef } from "react";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";

export const useIntervalAsync = (
  callback: () => void,
  delay: number | null
) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return undefined;
    }

    let isRunning = true;
    const interval = setIntervalAsync(() => {
      if (!isRunning) {
        if (interval) clearIntervalAsync(interval);
      }
      return savedCallback.current();
    }, delay);

    return () => {
      isRunning = false;
    };
  }, [delay]);
};

export default useIntervalAsync;
