import { Card, CardVerticalStack } from '@components/Cards'
import { PositioningTargetType } from '@shared/interfaces';
import React, { useMemo } from 'react'
import styled from 'styled-components';
import { Button } from '..';
import { ToggleButton } from '@components/Buttons/ToggleButton';
import { ButtonSize, ButtonType, ButtonUse } from '@components/Buttons';

type PositioningTargetTypeSelectorProps = {
  onPositioningTargetTypeChange?: (targetType: PositioningTargetType, enabled: boolean) => void;
  onSelection?: () => void;
  onClear?: () => void;
}

const PositioningTargetTypeSelectorGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(5, 1fr);
`

export const PositioningTargetTypeSelector = ({ onPositioningTargetTypeChange, onSelection, onClear }: PositioningTargetTypeSelectorProps) => {
  const targets: { state: number, name: string}[] = useMemo(() => {
    const keys = Object.keys(PositioningTargetType);
    return keys.map((key) => ({ state: 1, name: key }));
  }, []);

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
                onClick: (e) => {
                  if(onPositioningTargetTypeChange) {
                    onPositioningTargetTypeChange(target.name as PositioningTargetType, true);
                  }
                  if(onSelection) { onSelection();}
                  targets.find((t) => t.name === target.name)!.state = 2;
                }
              }}
              state2={{
                text: target.name,
                buttonUse: ButtonUse.Normal,
                buttonType: ButtonType.Primary,
                onClick: (e) => {
                  targets.find((t) => t.name === target.name)!.state = 1;
                  if(onPositioningTargetTypeChange) {
                    onPositioningTargetTypeChange(target.name as PositioningTargetType, false);
                  }
                  if(!targets.find((t) => t.state === 2) && onClear) {
                    onClear();
                  }
                }
              }}
              toggleStateOnClick={true}
              buttonSize={ButtonSize.Small}
              state={1}
          />))}
        </PositioningTargetTypeSelectorGrid>
      </Card>
  )
}