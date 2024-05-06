import React from "react";

import { useBeeStore } from "../../hooks";
import { useEffect } from "react";

type BeePollerProps = {
  children: React.ReactNode;
};

export const BeePoller = ({ children }: BeePollerProps) => {
  useEffect(() => {
    useBeeStore.getState().startPolling();
    return () => {
      useBeeStore.getState().stopPolling();
    };
  }, []);

  return <>{children}</>;
};
