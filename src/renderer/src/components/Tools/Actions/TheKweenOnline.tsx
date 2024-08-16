import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const TheKweenOnline = () => {
  const setLoading = useAppStore((state) => state.setLoading);

  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    try {
      const theKween = await window.kweenb.methods.theKween.fetchTheKween();
      setOutput(
        theKween.isOnline
          ? "The Kween is online"
          : "The Kween seems to be offline"
      );
      setOutputColor(
        theKween.isOnline ? "var(--green-status)" : "var(--red-status)"
      );
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      setLoading({ loading: false });
    }
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
