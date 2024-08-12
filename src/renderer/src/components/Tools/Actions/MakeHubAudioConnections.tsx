import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const MakeHubAudioConnections = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading({ loading: true });
    try {
      await window.kweenb.methods.theKween.makeHubAudioConnections();
      setOutput(`Audio connections were created`);
      setOutputColor(`var(--green-status)`);
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Make all audio connections on The Kween"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
