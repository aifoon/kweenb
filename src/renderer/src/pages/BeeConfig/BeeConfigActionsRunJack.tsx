import { ToggleButton } from "@components/Buttons/ToggleButton";
import {
  ButtonUse,
  ButtonType,
  ButtonSize,
} from "@renderer/src/components/Buttons";
import { useInterval } from "@renderer/src/hooks";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

export interface BeeConfigActionsRunProps {
  isRunning?: boolean;
}

/**
 * The state1 button
 */
export const state1Button = {
  buttonUse: ButtonUse.Dark,
  buttonType: ButtonType.Primary,
};

/**
 * The state2 button
 */
export const state2Button = {
  buttonUse: ButtonUse.Dark,
  buttonType: ButtonType.Secondary,
};

/**
 * A Custom ToggleButton with full width behaviour
 */
const CustomToggleButton = styled(ToggleButton)`
  width: 100%;
  height: 100%;
`;

export const BeeConfigActionsRunJack = ({
  isRunning: running = false,
}: BeeConfigActionsRunProps) => {
  const [isRunning, setIsRunning] = useState<boolean>(running);

  useEffect(() => setIsRunning(running), [running]);

  return (
    <CustomToggleButton
      state={!isRunning ? 1 : 2}
      state1={{
        ...state1Button,
        text: "Start Jack",
        onClick: () => console.log("Clicking on Start Jack"),
      }}
      state2={{
        ...state2Button,
        text: "Stop Jack",
        onClick: () => console.log("Clicking on Stop Jack"),
      }}
      buttonSize={ButtonSize.Small}
    />
  );
};
