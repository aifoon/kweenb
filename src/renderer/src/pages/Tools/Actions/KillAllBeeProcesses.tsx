import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const KillAllBeeProcesses = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    const activeBees = await window.kweenb.methods.fetchActiveBees();
    const killAllProcessesPromises = activeBees.map(async (bee) =>
      window.kweenb.methods.killJackAndJacktrip(bee)
    );
    await Promise.all(killAllProcessesPromises);
    appContext.setLoading(false);
    setOutput("Killed Jack & Jacktrip processes on all bees");
    setOutputColor("var(--green-status)");
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
