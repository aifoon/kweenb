import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const DisconnectP2PAudioConnectionsOnKweenB = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading(true);
    try {
      await window.kweenb.methods.disconnectP2PAudioConnectionsKweenB();
      setOutput(`Audio connections were disconnected`);
      setOutputColor(`var(--green-status)`);
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading(false);
    }
  }, []);

  return (
    <Action
      description="Disconnect all P2P audio connections on KweenB"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
