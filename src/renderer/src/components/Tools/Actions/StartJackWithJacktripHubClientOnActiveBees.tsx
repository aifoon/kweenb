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
      const activeBees = await window.kweenb.methods.fetchActiveBees();
      const startJackWithJacktripHubClientBeePromises = activeBees.map((bee) =>
        window.kweenb.methods.startJackWithJacktripHubClientBee(bee)
      );
      await Promise.all(startJackWithJacktripHubClientBeePromises);
      setOutput("Started Jack with Jacktrip hub client on bee.");
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
      description="Start Jacktrip hub client on active bees and connect with hub server on kweenb"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
