/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IBee } from "@shared/interfaces";

export function useBee(id: number) {
  const [loading, setLoading] = useState<boolean>(true);
  const [bee, setBee] = useState<IBee>({
    id: 0,
    name: "",
    ipAddress: "",
    isOnline: false,
    isActive: false,
    config: {
      jacktripVersion: "1.4.1",
      useMqtt: false,
    },
    status: {
      isJackRunning: false,
      isJacktripRunning: false,
    },
  });

  /**
   * Fetching the bee
   */
  const fetchBee = useCallback(async () => {
    setLoading(true);
    setBee(await window.kweenb.methods.fetchBee(id));
    setLoading(false);
    return bee;
  }, []);

  /**
   * Updating a bee
   */
  const updateBeeSetting = useCallback((updatedBee: Partial<IBee>) => {
    window.kweenb.methods.updateBee({ id, ...updatedBee });
  }, []);

  /**
   * When mounting, fetch all bees
   */
  useEffect(() => {
    // fetch the bees
    (async () => {
      await fetchBee();
    })();
  }, []);

  return { loading, bee, updateBeeSetting };
}
