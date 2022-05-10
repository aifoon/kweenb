import styled from "styled-components";
import { Button, ButtonUse, ButtonType, ButtonSize } from "@components/Buttons";
import { useEffect, useState } from "react";

export const ActionContainer = styled.div`
  display: grid;
  grid-template-columns: 50% 1fr 125px;
  column-gap: 0px;
  margin-bottom: 0px;
  font-size: var(--smallText);
  & div:last-child {
    border-right: 1px solid var(--primary-100);
  }
`;

const ActionDataContainer = styled.div`
  padding: 10px 10px;
  border-left: 1px solid var(--primary-100);
  border-bottom: 1px solid var(--primary-100);
`;

type ActionProps = {
  description: string;
  output?: string;
  actionButtonLabel?: string;
  outputColor?: string;
  onRunClick?: () => void;
};

export const Action = ({
  onRunClick,
  description = "",
  actionButtonLabel = "Run",
  output = "",
  outputColor = "var(--textColor)",
}: ActionProps) => {
  const [currentOutput, setCurrentOutput] = useState(output);
  const [currentOutputColor, setCurrentOutputColor] = useState(outputColor);

  useEffect(() => {
    setCurrentOutput(output);
  }, [output]);

  useEffect(() => {
    setCurrentOutputColor(outputColor);
  }, [outputColor]);

  return (
    <ActionContainer>
      <ActionDataContainer>{description}</ActionDataContainer>
      <ActionDataContainer style={{ color: currentOutputColor }}>
        {currentOutput}
      </ActionDataContainer>
      <ActionDataContainer>
        <Button
          style={{ width: "100%" }}
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onRunClick) onRunClick();
          }}
        >
          {actionButtonLabel}
        </Button>
      </ActionDataContainer>
    </ActionContainer>
  );
};
