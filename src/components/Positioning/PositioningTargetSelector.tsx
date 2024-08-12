import { Card } from "../Cards";
import { PositioningTargetType } from "../../shared/interfaces";
import React, { useMemo } from "react";
import styled from "styled-components";
import { ToggleButton } from "../Buttons/ToggleButton";
import { ButtonSize, ButtonType, ButtonUse } from "../Buttons";

type PositioningTargetTypeSelectorProps = {
  onPositioningTargetTypeChange?: (
    targetType: PositioningTargetType,
    enabled: boolean
  ) => void;
  onSelection?: () => void;
  onClear?: () => void;
  selectedTargetTypes?: PositioningTargetType[];
};

const PositioningTargetTypeSelectorGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(5, 1fr);
`;

export const PositioningTargetTypeSelector = ({
  onPositioningTargetTypeChange,
  onSelection,
  onClear,
  selectedTargetTypes,
}: PositioningTargetTypeSelectorProps) => {
  // desitlate the target types
  const targets: { state: 1 | 2; name: string }[] = useMemo(() => {
    const keys = Object.keys(PositioningTargetType);
    return keys.map((key: string) => ({
      state: selectedTargetTypes?.includes(key as PositioningTargetType)
        ? 2
        : 1,
      name: key,
    }));
  }, [selectedTargetTypes]);

  return (
    <Card>
      <PositioningTargetTypeSelectorGrid>
        {targets.map((target) => (
          <ToggleButton
            key={target.name}
            state1={{
              text: target.name,
              buttonUse: ButtonUse.Normal,
              buttonType: ButtonType.SecondaryWhite,
              onClick: () => {
                if (onPositioningTargetTypeChange) {
                  onPositioningTargetTypeChange(
                    target.name as PositioningTargetType,
                    true
                  );
                }
                if (onSelection) onSelection();

                targets.find((t) => t.name === target.name)!.state = 2;
              },
            }}
            state2={{
              text: target.name,
              buttonUse: ButtonUse.Normal,
              buttonType: ButtonType.Primary,
              onClick: () => {
                targets.find((t) => t.name === target.name)!.state = 1;
                if (onPositioningTargetTypeChange) {
                  onPositioningTargetTypeChange(
                    target.name as PositioningTargetType,
                    false
                  );
                }
                if (!targets.find((t) => t.state === 2) && onClear) {
                  onClear();
                }
              },
            }}
            toggleStateOnClick
            buttonSize={ButtonSize.Small}
            state={target.state}
          />
        ))}
      </PositioningTargetTypeSelectorGrid>
    </Card>
  );
};
