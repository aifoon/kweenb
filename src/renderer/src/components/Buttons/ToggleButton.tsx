import React, { useEffect, useState } from "react";
import { Button } from ".";
import { ButtonSize, ButtonUse, ButtonType } from "./Button";

interface ToggleButtonState {
  text: string;
  buttonUse: ButtonUse;
  buttonType: ButtonType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ToggleButtonProps {
  state1: ToggleButtonState;
  state2: ToggleButtonState;
  buttonSize: ButtonSize;
  toggleStateOnClick?: boolean;
  state: 1 | 2;
  style?: React.CSSProperties;
  className?: string;
}

export const ToggleButton = ({
  state1,
  state2,
  buttonSize = ButtonSize.Small,
  state = 1,
  toggleStateOnClick = false,
  style,
  className,
}: ToggleButtonProps) => {
  const [currentStateNumber, setCurrentStateNumber] = useState(state);
  const [currentState, setCurrentState] = useState(
    currentStateNumber === 1 ? state1 : state2
  );

  useEffect(() => {
    setCurrentStateNumber(state);
  }, [state]);

  useEffect(() => {
    setCurrentState(currentStateNumber === 1 ? state1 : state2);
  }, [currentStateNumber]);

  const { buttonUse, buttonType, text, onClick } = currentState;

  return (
    <Button
      buttonSize={buttonSize}
      buttonType={buttonType}
      buttonUse={buttonUse}
      onClick={(e) => {
        if (onClick) onClick(e);
        if (toggleStateOnClick)
          setCurrentStateNumber(currentStateNumber === 1 ? 2 : 1);
      }}
      style={style}
      className={className}
    >
      {text}
    </Button>
  );
};
