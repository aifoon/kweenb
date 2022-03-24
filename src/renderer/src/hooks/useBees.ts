/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IBee, IBeeInput } from "@shared/interfaces";

export function useBees() {
  const [loading, setLoading] = useState<boolean>(true);
  const [bees, setBees] = useState<IBee[]>([]);

  /**
   * Create a new bee
   */
  const createBee = useCallback(
    async (bee: IBeeInput) => {
      const createdBee = await window.kweenb.methods.createBee(bee);
      setBees([...bees, createdBee]);
    },
    [bees]
  );

  /**
   * Fetching the bees
   */
  const fetchAllBees = useCallback(async () => {
    setLoading(true);
    setBees(await window.kweenb.methods.fetchAllBees(true));
    setLoading(false);
  }, []);

  /**
   * Delete Bee
   */
  const deleteBee = useCallback(
    async (id: number) => {
      await window.kweenb.methods.deleteBee(id);
      const filteredBees = bees.filter((b) => b.id !== id);
      setBees(filteredBees);
    },
    [bees]
  );

  /**
   * When mounting, fetch all bees
   */
  useEffect(() => {
    // fetch the bees
    (async () => {
      await fetchAllBees();
    })();

    // start the beepoller in main world
    window.kweenb.actions.beesPoller("start");

    // check if we receive update polls from beepoller
    const removeAllListeners = window.kweenb.events.onUpdateBees(
      (event, updatedBees) => {
        setBees(updatedBees);
      }
    );

    // when unhooking the bees
    return () => {
      // stop the beepoller in main world
      window.kweenb.actions.beesPoller("stop");

      // remove all update-bee listeners
      removeAllListeners();
    };
  }, []);

  return { loading, bees, createBee, deleteBee, fetchAllBees };
}
