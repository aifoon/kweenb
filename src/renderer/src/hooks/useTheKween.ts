/**
 * A hook to get the status of the kween
 */

import { ITheKween } from "@shared/interfaces";
import { useCallback, useState } from "react";
import { pollingInterval } from "../consts";
import { useInterval } from "./useInterval";

export function useTheKween() {
  const [thekween, setTheKween] = useState<ITheKween>();

  const fetchTheKweenState = useCallback(async () => {
    const theKween = window.kweenb.methods.fetchTheKween();
    setTheKween(await theKween);
  }, []);

  useInterval(fetchTheKweenState, pollingInterval);

  return { thekween };
}
