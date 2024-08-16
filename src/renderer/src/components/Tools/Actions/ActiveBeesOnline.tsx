import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const ActiveBeesOnline = () => {
  const setLoading = useAppStore((state) => state.setLoading);

  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    const activeBees = await window.kweenb.methods.fetchActiveBees();
    setLoading({ loading: false });

    // if no active bees
    if (!activeBees || activeBees.length === 0) {
      setOutput("No active bees available.");
      setOutputColor("var(--green-status)");
      return;
    }

    // do we have offline bees
    const hasOfflineBees = activeBees.filter((bee) => !bee.isOnline).length > 0;

    // if true, show the offline ones
    // if false, show the online ones
    if (hasOfflineBees) {
      const filteredBees = activeBees.filter((bee) => !bee.isOnline);
      setOutput(
        `${filteredBees.map(({ name }) => name).join(",")} ${
          filteredBees.length > 1 ? "are" : "is"
        } offline.`
      );
    } else {
      const filteredBees = activeBees.filter((bee) => bee.isOnline);
      setOutput(
        `${filteredBees.map(({ name }) => name).join(",")} ${
          filteredBees.length > 1 ? "are" : "is"
        } online.`
      );
    }
    setOutputColor(
      !hasOfflineBees ? "var(--green-status)" : "var(--red-status)"
    );
  }, []);

  return (
    <Action
      description="Check if all active bees are online"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
