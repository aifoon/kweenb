import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const MakeP2PAudioConnectionOnActiveBees = () => {
  const setLoading = useAppStore((state) => state.setLoading);

  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    try {
      const getActiveBees = await window.kweenb.methods.fetchActiveBees();
      const makeP2PAudioConnectionBeePromises = getActiveBees.map((bee) =>
        window.kweenb.methods.makeP2PAudioConnectionBee(bee)
      );
      await Promise.all(makeP2PAudioConnectionBeePromises);
      setOutput("Audio connections were created");
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
      description="Make P2P audio connection on active bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
