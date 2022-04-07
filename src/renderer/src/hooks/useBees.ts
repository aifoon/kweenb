/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IBee, IBeeInput } from "@shared/interfaces";

export function useBees() {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeBees, setActiveBees] = useState<IBee[]>([]);
  const [inActiveBees, setInActiveBees] = useState<IBee[]>([]);

  /**
   * Sets the active bees
   */
  const setBeeActive = useCallback(
    async (number: number, active: boolean) => {
      // set in database
      await window.kweenb.actions.setBeeActive(number, active);

      // switch in frontend
      if (active) {
        const beeToSwitch = inActiveBees.find(({ id }: IBee) => id === number);
        setInActiveBees(inActiveBees.filter(({ id }) => id !== number));
        if (beeToSwitch) setActiveBees([...activeBees, beeToSwitch]);
      } else {
        const beeToSwitch = activeBees.find(({ id }: IBee) => id === number);
        setActiveBees(activeBees.filter(({ id }) => id !== number));
        if (beeToSwitch) setInActiveBees([...inActiveBees, beeToSwitch]);
      }
    },
    [activeBees, inActiveBees]
  );

  /**
   * Create a new bee
   */
  const createBee = useCallback(
    async (bee: IBeeInput) => {
      const createdBee = await window.kweenb.methods.createBee(bee);
      const newActiveBees = [...activeBees, createdBee];
      newActiveBees.sort((a, b) => a.id - b.id);
      setActiveBees(newActiveBees);
    },
    [activeBees]
  );

  /**
   * Fetching the active bees
   */
  const fetchActiveBees = useCallback(async () => {
    try {
      const fetchedActiveBees = await window.kweenb.methods.fetchActiveBees();
      fetchedActiveBees.sort((a, b) => a.id - b.id);
      setActiveBees(fetchedActiveBees);
    } catch (e: any) {
      console.log(e.message);
    }
  }, [activeBees]);

  /**
   * Fetching the inactive bees
   */
  const fetchInActiveBees = useCallback(async () => {
    const fetchedInActiveBees = await window.kweenb.methods.fetchInActiveBees();
    fetchedInActiveBees.sort((a, b) => a.id - b.id);
    setInActiveBees(fetchedInActiveBees);
  }, [inActiveBees]);

  /**
   * Delete Bee
   */
  const deleteBee = useCallback(
    async (id: number) => {
      await window.kweenb.methods.deleteBee(id);
      const filteredBees = activeBees.filter((b) => b.id !== id);
      setActiveBees(filteredBees);
    },
    [activeBees]
  );

  /**
   * When mounting, fetch all bees
   */
  useEffect(() => {
    // fetch the bees
    (async () => {
      setLoading(true);
      await fetchActiveBees();
      await fetchInActiveBees();
      setLoading(false);
    })();

    // start the beepoller in main world
    window.kweenb.actions.beesPoller("start");

    // check if we receive update polls from beepoller
    const removeAllListeners = window.kweenb.events.onUpdateBees(
      (event, updatedBees) => {
        setActiveBees(updatedBees);
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

  return {
    loading,
    activeBees,
    inActiveBees,
    createBee,
    deleteBee,
    fetchInActiveBees,
    fetchActiveBees,
    setBeeActive,
  };
}
