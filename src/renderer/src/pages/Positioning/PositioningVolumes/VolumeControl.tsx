import { ButtonSize, ButtonType, ButtonUse } from '@components/Buttons';
import { ToggleButton } from '@components/Buttons/ToggleButton';
import { useBees, usePositioningTargetSelector } from '@renderer/src/hooks';
import React, { useCallback, useEffect } from 'react'
import { PositioningTargetTypeSelector } from '@components/Positioning/PositioningTargetSelector';
import { PositioningControllerAlgorithm, PositioningTargetType } from '@shared/interfaces';
import { Card, CardVerticalStack } from '@components/Cards';

type VolumeControlProps = {}

export const VolumeControl = (props: VolumeControlProps) => {
  const { activeBees } = useBees();
  const {
    handleOnPositioningTargetTypeChange,
    handleOnClear,
    handleOnSelection
  } = usePositioningTargetSelector(PositioningControllerAlgorithm.VOLUME_CONTROL_XY);

  return (
    <CardVerticalStack>
      <PositioningTargetTypeSelector
        onPositioningTargetTypeChange={handleOnPositioningTargetTypeChange}
        onClear={handleOnClear}
        onSelection={handleOnSelection}
      />
      <Card>
        {activeBees.map((bee) => (
          <ToggleButton
            key={bee.id}
            state1={{
              text: bee.name,
              buttonUse: ButtonUse.Dark,
              buttonType: ButtonType.Secondary
            }}
            state2={{
              text: bee.name,
              buttonUse: ButtonUse.Dark,
              buttonType: ButtonType.Primary
            }}
            toggleStateOnClick={true}
            buttonSize={ButtonSize.Medium}
            state={1}
          />
        ))}
      </Card>
    </CardVerticalStack>
  )
}