import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const KillAllKweenBProcesses = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading({ loading: true });
    try {
      await window.kweenb.methods.killJackAndJacktripOnKweenB();
      setOutput("Killed Jack & Jacktrip processes on KweenB");
      setOutputColor("var(--green-status)");
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Kill all Jack & Jacktrip processes on KweenB"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
