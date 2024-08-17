/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChannelType, IBee, IBeeConfig } from "@shared/interfaces";
import { AppMode } from "@shared/enums";
import { useAppStore } from "../hooks";
import { useIntervalAsync } from "./useIntervalAsync";
import { pollingInterval } from "../consts";

export function useBee(id: number) {
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
      if (appMode === AppMode.Hub) {
        await window.kweenb.methods.killJackAndJacktrip(bee);
        await window.kweenb.methods.startJackWithJacktripHubClientBee(bee);
        await window.kweenb.methods.makeAudioConnectionBee(bee);
        // @note: this is not implemented in the main process yet
        // the problem is that when we need te reconnect in HUB mode
        // we need to remember the connections of all the other bees as well
        // the bees are not connected by bee1 --> channel1 --> send1
        // the way we pick send1 is random
        // e.g. swarm has bee3, bee7 and bee8
        // bee3 --> channel3 --> send1
        // bee7 --> channel7 --> send2
        // bee8 --> channel8 --> send3
        // if bee7 needs to reconnect, we need to remember that bee7 was connected to send2
        // and that is not the case right now
        // we hide the reconnect button in the UI for now
        // await window.kweenb.methods.makeHubAudioConnectionKweenB(bee);
      }
      if (appMode === AppMode.P2P) {
        await window.kweenb.methods.killJackAndJacktrip(bee);
        await window.kweenb.methods.startJackWithJacktripP2PServerBee(bee);
        await window.kweenb.methods.startJackWithJacktripP2PClientKweenB(bee);
        await window.kweenb.methods.makeP2PAudioConnectionKweenB(bee);
        await window.kweenb.methods.makeAudioConnectionBee(bee);
      }
    } catch (e: any) {
      console.error(`reconnect: ${e.message}`);
    } finally {
      setLoading({ loading: false, text: "reconnect" });
    }
  }, [bee]);

  /**
   * Kill Jack
   */
  const killJack = useCallback(async () => {
    try {
      setLoading({ loading: true });
      await window.kweenb.methods.killJack(bee);
      bee.status.isJackRunning = false;
      setBee(bee);
    } catch (e: any) {
      console.error(`killJack: ${e.message}`);
    } finally {
      setLoading({ loading: false, text: "killJack" });
    }
  }, [bee]);

  /**
   * Kill Jacktrip
   */
  const killJacktrip = useCallback(async () => {
    try {
      setLoading({ loading: true });
      await window.kweenb.methods.killJacktrip(bee);
      bee.status.isJacktripRunning = false;
      setBee(bee);
    } catch (e: any) {
      console.error(`killJacktrip: ${e.message}`);
    } finally {
      setLoading({ loading: false, text: "killJacktrip" });
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
   * Start Jack
   */
  const startJack = useCallback(async () => {
    try {
      setLoading({ loading: true });
      await window.kweenb.methods.startJack(bee);
      bee.status.isJackRunning = true;
      setBee(bee);
    } catch (e: any) {
      console.error(`startJack: ${e.message}`);
    } finally {
      setLoading({ loading: false, text: "startJack" });
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
   * Save the config in zwerm3api
   */
  const saveConfig = useCallback(
    (config: Partial<IBeeConfig>) => {
      window.kweenb.methods.saveConfig(bee, config);
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
    if (isMounted.current) {
      setBee(await window.kweenb.methods.fetchBee(id));
    }
  }, pollingInterval);

  return {
    bee,
    reconnect,
    killJack,
    killJacktrip,
    killJackAndJacktrip,
    // loading,
    saveConfig,
    startJack,
    updateBeeSetting,
  };
}
