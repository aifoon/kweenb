import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const StartJackWithJacktripClientOnActiveBees = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    try {
      const getActiveBees = await window.kweenb.methods.fetchActiveBees();
      const startJackWithJacktripClientPromises = getActiveBees.map((bee) =>
        window.kweenb.methods.startJackWithJacktripClient(bee)
      );
      await Promise.all(startJackWithJacktripClientPromises);
      setOutput("Started Hub server on The Kween");
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
      description="Start Jack and Jacktrip Client on all bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
