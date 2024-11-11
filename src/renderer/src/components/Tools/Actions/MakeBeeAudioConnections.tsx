import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const MakeBeeAudioConnections = () => {
  const setLoading = useAppStore((state) => state.setLoading);

  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    try {
      const activeBees = await window.kweenb.methods.fetchActiveBees();
      await window.kweenb.methods.makeAudioConnectionBee(activeBees);

      setOutput(`Audio connections were created`);
      setOutputColor(`var(--green-status)`);
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Make audio connections on active bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
