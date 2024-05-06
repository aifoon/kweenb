/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { IBee, IBeeInput } from "@shared/interfaces";
import { useBeeStore } from "./useBeeStore";

export function useBees() {
  const [loading, setLoading] = useState<boolean>(true);

  const setActive = useBeeStore((state) => state.setActive);

  /**
   * Create a new bee
   */
  const createBee = useCallback(async (bee: IBeeInput) => {
    const createdBee = await window.kweenb.methods.createBee(bee);
    setActive(createdBee.id);
  }, []);

  /**
   * When mouting, listen for imported bees
   */
  useEffect(() => {
    const removeEventListener = window.kweenb.events.onImportedBees(() => {
      setLoading(true);
      // fetchActiveBees();
      // fetchInActiveBees();
      setLoading(false);
    });
    return () => removeEventListener();
  }, []);

  return {
    loading,
    createBee,
  };
}
