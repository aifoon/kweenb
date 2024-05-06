import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const StartJackWithJacktripP2PClientOnKweenB = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading({ loading: true });
    try {
      const getActiveBees = await window.kweenb.methods.fetchActiveBees();
      const startJackWithJacktripP2PClientPromises = getActiveBees.map((bee) =>
        window.kweenb.methods.startJackWithJacktripP2PClientKweenB(bee)
      );
      await Promise.all(startJackWithJacktripP2PClientPromises);
      setOutput("Started Jack and Jacktrip P2P clients on KweenB");
      setOutputColor("var(--green-status)");
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Start Jack and Jacktrip P2P clients on KweenB"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
