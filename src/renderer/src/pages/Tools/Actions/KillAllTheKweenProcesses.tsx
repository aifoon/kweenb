import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const KillAllTheKweenProcesses = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    await window.kweenb.methods.killJackAndJacktripOnTheKween();
    appContext.setLoading(false);
    setOutput("Killed Jack & Jacktrip processes on The Kween");
    setOutputColor("var(--green-status)");
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
