import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const TheKweenOnline = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    const theKween = await window.kweenb.methods.fetchTheKween();
    appContext.setLoading(false);
    setOutput(
      theKween.isOnline
        ? "The Kween is online"
        : "The Kween seems to be offline"
    );
    setOutputColor(
      theKween.isOnline ? "var(--green-status)" : "var(--red-status)"
    );
  }, []);

  return (
    <Action
      description="Check if The Kween is online"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
