import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const StartJackWithJacktripP2PServerOnActiveBees = () => {
  // App Store
  const setLoading = useAppStore((state) => state.setLoading);

  // Inner State
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    try {
      const getActiveBees = await window.kweenb.methods.fetchActiveBees();
      const startJackWithJacktripP2PServerPromises = getActiveBees.map((bee) =>
        window.kweenb.methods.startJackWithJacktripP2PServerBee(bee)
      );
      await Promise.all(startJackWithJacktripP2PServerPromises);
      setOutput("Started Jack and Jacktrip P2P server on active bees");
      setOutputColor("var(--green-status)");
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Start Jack and Jacktrip P2P server on active bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
