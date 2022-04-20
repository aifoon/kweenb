/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { IBee, IBeeInput } from "@shared/interfaces";

export function useBees() {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeBees, setActiveBees] = useState<IBee[]>([]);
  const [inActiveBees, setInActiveBees] = useState<IBee[]>([]);

  const inactiveBeesRef = useRef<IBee[]>();
  const activeBeesRef = useRef<IBee[]>();

  useEffect(() => {
    inactiveBeesRef.current = inActiveBees;
  }, [inActiveBees]);

  useEffect(() => {
    activeBeesRef.current = activeBees;
  }, [activeBees]);

  /**
   * Sets the active bees
   */
  const setBeeActive = useCallback(
    async (number: number, active: boolean) => {
      // set in database
      await window.kweenb.actions.setBeeActive(number, active);

      // validate current bees
      if (!inactiveBeesRef.current || !activeBeesRef.current) return;

      // switch in frontend
      if (active) {
        // get the bee to switch
        const beeToSwitch = inactiveBeesRef.current.find(
          ({ id }: IBee) => id === number
        );

        // create & set the new inactive bees
        const newInactiveBees = inactiveBeesRef.current
          .filter(({ id }) => id !== number)
          .sort((a, b) => a.id - b.id);
        setInActiveBees(newInactiveBees);

        // create & set the new active bees
        if (beeToSwitch) {
          const newActiveBees = [...activeBeesRef.current, beeToSwitch].sort(
            (a, b) => a.id - b.id
          );
          setActiveBees(newActiveBees);
        }
      } else {
        // get the bee to switch
        const beeToSwitch = activeBeesRef.current.find(
          ({ id }: IBee) => id === number
        );

        // create & set the new active bees
        const newActiveBees = activeBeesRef.current
          .filter(({ id }) => id !== number)
          .sort((a, b) => a.id - b.id);
        setActiveBees(newActiveBees);

        // create & set the new inactive bees
        if (beeToSwitch) {
          const newInactiveBees = [
            ...inactiveBeesRef.current,
            beeToSwitch,
          ].sort((a, b) => a.id - b.id);
          setInActiveBees(newInactiveBees);
        }
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
      const fetchedActiveBees =
        await window.kweenb.methods.fetchActiveBeesData();
      fetchedActiveBees.sort((a, b) => a.id - b.id);
      setActiveBees(fetchedActiveBees);
    } catch (e: any) {
      console.error(e.message);
    }
  }, [activeBees]);

  /**
   * Fetching the inactive bees
   */
  const fetchInActiveBees = useCallback(async () => {
    const fetchedInActiveBees =
      await window.kweenb.methods.fetchInActiveBeesData();
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
