/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IBee } from "@shared/interfaces";
import { useAppContext } from "./useAppContext";

export function useBee(id: number) {
  const [loading, setLoading] = useState<boolean>(true);
  const { appContext } = useAppContext();
  const [bee, setBee] = useState<IBee>({
    id: 0,
    name: "",
    ipAddress: "",
    isOnline: false,
    isApiOn: false,
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
    setBee(await window.kweenb.methods.fetchBee(id));
    return bee;
  }, [bee]);

  /**
   * Kill Jack
   */
  const killJack = useCallback(async () => {
    try {
      appContext.setLoading(true);
      await window.kweenb.methods.killJack(bee);
      bee.status.isJackRunning = false;
      setBee(bee);
    } catch (e: any) {
      console.error(`killJack: ${e.message}`);
    } finally {
      appContext.setLoading(false);
    }
  }, [bee]);

  /**
   * Kill Jacktrip
   */
  const killJacktrip = useCallback(async () => {
    try {
      appContext.setLoading(true);
      await window.kweenb.methods.killJacktrip(bee);
      bee.status.isJacktripRunning = false;
      setBee(bee);
    } catch (e: any) {
      console.error(`killJacktrip: ${e.message}`);
    } finally {
      appContext.setLoading(false);
    }
  }, [bee]);

  /**
   * Kills Jack And Jacktrip
   */
  const killJackAndJacktrip = useCallback(async () => {
    try {
      appContext.setLoading(true);
      await window.kweenb.methods.killJackAndJacktrip(bee);
      bee.status.isJackRunning = false;
      bee.status.isJacktripRunning = false;
      setBee(bee);
    } catch (e: any) {
      console.error(`killJackAndJacktrip: ${e.message}`);
    } finally {
      appContext.setLoading(false);
    }
  }, [bee]);

  /**
   * Start Jack
   */
  const startJack = useCallback(async () => {
    try {
      appContext.setLoading(true);
      await window.kweenb.methods.startJack(bee);
      bee.status.isJackRunning = true;
      setBee(bee);
    } catch (e: any) {
      console.error(`startJack: ${e.message}`);
    } finally {
      appContext.setLoading(false);
    }
  }, [bee]);

  /**
   * Updating a bee
   */
  const updateBeeSetting = useCallback(
    (updatedBee: Partial<IBee>) => {
      window.kweenb.methods.updateBee({ id, ...updatedBee });
    },
    [bee]
  );

  /**
   * When mounting, fetch all bees
   */
  useEffect(() => {
    // fetch the bees
    (async () => {
      setLoading(true);
      await fetchBee();
      setLoading(false);
    })();

    // start the beepoller in main world
    window.kweenb.actions.beePoller("start", [id]);

    // check if we receive update polls from beepoller
    const removeAllListeners = window.kweenb.events.onUpdateBee(
      (event, updatedBee) => {
        setBee(updatedBee);
        console.log(updatedBee);
      }
    );

    // when unhooking the bees
    return () => {
      // stop the beepoller in main world
      window.kweenb.actions.beePoller("stop");

      // remove all update-bee listeners
      removeAllListeners();
    };
  }, []);

  return {
    loading,
    bee,
    killJack,
    killJacktrip,
    killJackAndJacktrip,
    startJack,
    updateBeeSetting,
  };
}
