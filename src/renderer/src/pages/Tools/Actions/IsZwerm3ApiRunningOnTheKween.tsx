import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const IsZwerm3ApiRunningOnTheKween = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    try {
      const isZwerm3ApiRunningOnTheKween =
        await window.kweenb.methods.isZwerm3ApiRunningOnTheKween();
      setOutput(
        isZwerm3ApiRunningOnTheKween
          ? "Zwerm 3 API is running on The Kween"
          : "Zwerm 3 API seems not to be running on The Kween"
      );
      setOutputColor(
        isZwerm3ApiRunningOnTheKween
          ? "var(--green-status)"
          : "var(--red-status)"
      );
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading(false);
    }
  }, []);

  return (
    <Action
      description="Check if Zwerm 3 API is running on The Kween"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
