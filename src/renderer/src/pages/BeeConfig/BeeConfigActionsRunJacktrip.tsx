import { ToggleButton } from "@components/Buttons/ToggleButton";
import { ButtonSize } from "@renderer/src/components/Buttons";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  BeeConfigActionsRunProps,
  state1Button,
  state2Button,
} from "./BeeConfigActionsRunJack";

/**
 * A Custom ToggleButton with full width behaviour
 */
const CustomToggleButton = styled(ToggleButton)`
  width: 100%;
  height: 100%;
`;

export const BeeConfigActionsRunJacktrip = ({
  isRunning: running = false,
}: BeeConfigActionsRunProps) => {
  const [isRunning, setIsRunning] = useState<boolean>(running);

  useEffect(() => setIsRunning(running), [running]);

  return (
    <CustomToggleButton
      state={!isRunning ? 1 : 2}
      state1={{
        ...state1Button,
        text: "Start Jacktrip",
        onClick: () => console.log("Clicking on Start Jacktrip"),
      }}
      state2={{
        ...state2Button,
        text: "Stop Jacktrip",
        onClick: () => console.log("Clicking on Stop Jacktrip"),
      }}
      buttonSize={ButtonSize.Small}
    />
  );
};
