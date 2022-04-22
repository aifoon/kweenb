import { ToggleButton } from "@components/Buttons/ToggleButton";
import {
  ButtonUse,
  ButtonType,
  ButtonSize,
} from "@renderer/src/components/Buttons";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

export interface BeeConfigActionsRunProps {
  isRunning?: boolean;
  onStart?: () => void;
  onStop?: () => void;
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
  buttonUse: ButtonUse.Danger,
  buttonType: ButtonType.Primary,
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
  onStart,
  onStop,
}: BeeConfigActionsRunProps) => {
  const [isRunning, setIsRunning] = useState<boolean>(running);

  useEffect(() => setIsRunning(running), [running]);

  return (
    <CustomToggleButton
      state={!isRunning ? 1 : 2}
      state1={{
        ...state1Button,
        text: "Start",
        onClick: () => {
          if (onStart) onStart();
        },
      }}
      state2={{
        ...state2Button,
        text: "Stop",
        onClick: () => {
          if (onStop) onStop();
        },
      }}
      buttonSize={ButtonSize.Small}
    />
  );
};
