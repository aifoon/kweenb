/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { IBee } from "@shared/interfaces";
import { BeeDeviceManagerActions, ChannelType } from "@shared/enums";
import { AppMode } from "@shared/enums";
import { useAppStore } from "../hooks";
import { useIntervalAsync } from "./useIntervalAsync";
import { pollingInterval } from "../consts";

export function useBee(id: number, syncWithInterval = true) {
  const setLoading = useAppStore((state) => state.setLoading);
  const appMode = useAppStore((state) => state.appMode);

  const isMounted = useRef(true);
  const [bee, setBee] = useState<IBee>({
    id: 0,
    name: "...",
    ipAddress: "...",
    isOnline: false,
    isApiOn: false,
    isActive: false,
    channel1: 0,
    channel2: 0,
    networkPerformanceMs: 0,
    channelType: ChannelType.MONO,
    status: {
      isJackRunning: false,
      isJacktripRunning: false,
    },
  });

  /**
   * Fetching the bee
   */
  const fetchBee = useCallback(async () => {
    const fetchedBee = await window.kweenb.methods.fetchBee(id);
    if (isMounted.current) {
      setBee(fetchedBee);
    }
    return fetchedBee;
  }, [bee]);

  /**
   * Reconnect
   */
  const reconnect = useCallback(async () => {
    try {
      setLoading({ loading: true });
      // starting the bee replaces whatever was running on it; the bee
      // starts Jack, Jacktrip and Pure Data and makes its own audio connection
      if (appMode === AppMode.Hub) {
        await window.kweenb.methods.startJackWithJacktripHubClientBee(bee);
        // @note: the connection on kweenb is not made here, the reconnect
        // button is hidden in HUB mode for now (see BeeConfigActions)
      }
      if (appMode === AppMode.P2P) {
        // the bee waits for the connection of kweenb, so both are started
        // before the bee is awaited
        const startOnBee =
          window.kweenb.methods.startJackWithJacktripP2PServerBee(bee);
        await window.kweenb.methods.startJackWithJacktripP2PClientKweenB(bee);
        await startOnBee;
        await window.kweenb.methods.makeP2PAudioConnectionKweenB(bee);
      }
    } catch (e: any) {
      console.error(`reconnect: ${e.message}`);
    } finally {
      setLoading({ loading: false, text: "reconnect" });
    }
  }, [bee]);

  /**
   * Kills Jack And Jacktrip
   */
  const killJackAndJacktrip = useCallback(async () => {
    try {
      setLoading({ loading: true });
      await window.kweenb.methods.killJackAndJacktrip(bee);
      bee.status.isJackRunning = false;
      bee.status.isJacktripRunning = false;
      setBee(bee);
    } catch (e: any) {
      console.error(`killJackAndJacktrip: ${e.message}`);
    } finally {
      setLoading({ loading: false, text: "killJackAndJacktrip" });
    }
  }, [bee]);

  /**
   * Restart or switch off the bee
   */
  const manageDevice = useCallback(
    async (action: BeeDeviceManagerActions) => {
      try {
        setLoading({ loading: true });
        await window.kweenb.methods.manageBeeDevice(bee, action);
      } catch (e: any) {
        console.error(`manageDevice: ${e.message}`);
      } finally {
        setLoading({ loading: false, text: "manageDevice" });
      }
    },
    [bee]
  );

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
    fetchBee();
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Use an interval to fetch a bee
   */
  useIntervalAsync(async () => {
    if (!syncWithInterval) return;
    if (isMounted.current) {
      const fetchedBee = await window.kweenb.methods.fetchBee(id);
      setBee(fetchedBee);
    }
  }, pollingInterval);

  return {
    bee,
    reconnect,
    killJackAndJacktrip,
    manageDevice,
    updateBeeSetting,
  };
}
