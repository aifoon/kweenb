/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IBee } from "@shared/interfaces";

export function useBees() {
  const [loading, setLoading] = useState<boolean>(true);
  const [bees, setBees] = useState<IBee[]>([]);

  /**
   * Fetching the bees
   */
  const fetchAllBees = useCallback(async () => {
    setLoading(true);
    const allBees = await window.kweenb.methods.fetchAllBees();
    setLoading(false);
    return allBees;
  }, []);

  /**
   * When mounting, fetch all bees
   */
  useEffect(() => {
    // fetch the bees
    (async () => {
      const fetchedBees = await fetchAllBees();
      console.log(fetchedBees);
      setBees(fetchedBees);
    })();

    // start the beepoller in main world
    window.kweenb.actions.beesPoller("start");

    // check if we receive update polls from beepoller
    const removeAllListeners = window.kweenb.events.onUpdateBees(
      (event, updatedBees) => setBees(updatedBees)
    );

    // when unhooking the bees
    return () => {
      // stop the beepoller in main world
      window.kweenb.actions.beesPoller("stop");

      // remove all update-bee listeners
      removeAllListeners();
    };
  }, []);

  return { loading, bees };
}
