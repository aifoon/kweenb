import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const IsZwerm3ApiRunningOnBees = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading({ loading: true });
    try {
      const activeBees = await window.kweenb.methods.fetchActiveBees();

      // if no active bees
      if (!activeBees || activeBees.length === 0) {
        setOutput("No active bees available.");
        setOutputColor("var(--green-status)");
        return;
      }

      // do we have offline bees
      const hasBeesWithoutZwerm3ApiRunning =
        activeBees.filter((bee) => !bee.isApiOn).length > 0;

      // if true, show the offline ones
      // if false, show the online ones
      if (hasBeesWithoutZwerm3ApiRunning) {
        const filteredBees = activeBees.filter((bee) => !bee.isApiOn);
        setOutput(
          `${filteredBees.map(({ name }) => name).join(",")} ${
            filteredBees.length > 1 ? "have" : "has"
          } an offline zwerm3api.`
        );
      } else {
        const filteredBees = activeBees.filter((bee) => bee.isOnline);
        setOutput(
          `${filteredBees.map(({ name }) => name).join(",")} ${
            filteredBees.length > 1 ? "have" : "has"
          } an online zwerm3api.`
        );
      }

      // set the output color
      setOutputColor(
        !hasBeesWithoutZwerm3ApiRunning
          ? "var(--green-status)"
          : "var(--red-status)"
      );
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Check if Zwerm 3 API is running on the active bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
