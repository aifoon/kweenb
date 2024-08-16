import { Action } from "@components/Actions";
import { useAppStore } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const StartJackWithJacktripHubClientOnActiveBees = () => {
  const setLoading = useAppStore((state) => state.setLoading);

  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");

  const onRunClick = useCallback(async () => {
    setLoading({ loading: true });
    try {
      const getActiveBees = await window.kweenb.methods.fetchActiveBees();
      const startJackWithJacktripHubClientPromises = getActiveBees.map((bee) =>
        window.kweenb.methods.startJackWithJacktripHubClientBee(bee)
      );
      await Promise.all(startJackWithJacktripHubClientPromises);
      setOutput("Started Jack and Jacktrip client on all bees");
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
      description="Start Jack and Jacktrip Client on all bees"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
