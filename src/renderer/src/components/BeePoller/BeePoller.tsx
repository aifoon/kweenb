import React from "react";

import { useBeeStore } from "../../hooks";
import { useEffect } from "react";

type BeePollerProps = {
  children: React.ReactNode;
};

export const BeePoller = ({ children }: BeePollerProps) => {
  /**
   * When mounting, start polling for bees
   */
  useEffect(() => {
    useBeeStore.getState().startPolling();
    return () => {
      useBeeStore.getState().stopPolling();
    };
  }, []);

  /**
   * When mouting, listen for imported bees
   */
  useEffect(() => {
    const removeEventListener = window.kweenb.events.onImportedBees(() => {
      useBeeStore.getState().initializeBees();
    });
    return () => removeEventListener();
  }, []);

  return <>{children}</>;
};
