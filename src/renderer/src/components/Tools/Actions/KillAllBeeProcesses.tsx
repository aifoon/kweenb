import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const KillAllBeeProcesses = () => {
  const setLoading = useAppStore((state) => state.setLoading);

  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    try {
      const activeBees = await window.kweenb.methods.fetchActiveBees();
      const killAllProcessesPromises = activeBees.map((bee) =>
        window.kweenb.methods.killJackAndJacktrip(bee)
      );
      await Promise.all(killAllProcessesPromises);
      setOutput("Killed Jack & Jacktrip processes on all bees");
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
      description="Kill all Jack & Jacktrip processes on all bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
