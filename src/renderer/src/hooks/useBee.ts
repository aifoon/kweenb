/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IBee, IBeeConfig } from "@shared/interfaces";
import { AppMode } from "@shared/enums";
import { useAppContext } from "./useAppContext";
import { useInterval } from "./useInterval";
import { pollingInterval } from "../consts";

export function useBee(id: number) {
  const [loading, setLoading] = useState<boolean>(true);
  const { appContext } = useAppContext();
  const [bee, setBee] = useState<IBee>({
    id: 0,
    name: "...",
    ipAddress: "...",
    isOnline: false,
    isApiOn: false,
    isActive: false,
    config: {
      useMqtt: false,
      mqttBroker: "mqtt://localhost:1883",
      mqttChannel: "beeworker",
      device: "",
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
    const fetchedBee = await window.kweenb.methods.fetchBee(id);
    setBee(fetchedBee);
    return bee;
  }, [bee]);

  /**
   * Reconnect
   */
  const reconnect = useCallback(async () => {
    try {
      appContext.setLoading(true);
      if (appContext.appMode === AppMode.Hub) {
        await window.kweenb.methods.hookBeeOnCurrentHive(bee);
      }
      if (appContext.appMode === AppMode.P2P) {
        await window.kweenb.methods.killJackAndJacktrip(bee);
        await window.kweenb.methods.startJackWithJacktripP2PServerBee(bee);
        await window.kweenb.methods.startJackWithJacktripP2PClientKweenB(bee);
        await window.kweenb.methods.makeP2PAudioConnectionKweenB(bee);
        await window.kweenb.methods.makeP2PAudioConnectionBee(bee);
      }
    } catch (e: any) {
      console.error(`reconnect: ${e.message}`);
    } finally {
      appContext.setLoading(false);
    }
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
    // fetch the bees
    (async () => {
      setLoading(true);
      await fetchBee();
      setLoading(false);
    })();
  }, []);

  /**
   * Use an interval to fetch a bee
   */
  useInterval(async () => {
    await fetchBee();
  }, pollingInterval);

  return {
    bee,
    reconnect,
    killJack,
    killJacktrip,
    killJackAndJacktrip,
    loading,
    saveConfig,
    startJack,
    updateBeeSetting,
  };
}
