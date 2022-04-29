import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const KillAllTheKweenProcesses = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    try {
      await window.kweenb.methods.killJackAndJacktripOnTheKween();
      setOutput("Killed Jack & Jacktrip processes on The Kween");
      setOutputColor("var(--green-status)");
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading(false);
    }
  }, []);

  return (
    <Action
      description="Kill all Jack & Jacktrip processes on The Kween"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
