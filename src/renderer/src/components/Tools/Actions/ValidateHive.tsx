import { Action } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import React, { useCallback, useState } from "react";

export const ValidateHive = () => {
  const [output, setOutput] = useState("");
  const [outputColor, setOutputColor] = useState("var(--textColor");
  const { appContext } = useAppContext();

  const onRunClick = useCallback(async () => {
    appContext.setLoading({ loading: true });
    try {
      const isValid = await window.kweenb.methods.theKween.validateHive();
      setOutput(`The hive is ${isValid ? "valid" : "invalid"}`);
      setOutputColor(`var(--${isValid ? "green" : "red"}-status)`);
    } catch (e: any) {
      setOutput(e.message);
      setOutputColor("var(--red-status)");
    } finally {
      appContext.setLoading({ loading: false });
    }
  }, []);

  return (
    <Action
      description="Validate if hive contains all the bees and KweenB"
      onRunClick={onRunClick}
      output={output}
      outputColor={outputColor}
    />
  );
};
