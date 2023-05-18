import {
  ITargetAndOptionsForPositioningAlgorithm,
  PositioningControllerAlgorithm,
  PositioningTargetType,
} from "@shared/interfaces";
import { useCallback, useEffect, useState } from "react";

export function usePositioningTargetSelector<TAlgorithmOptions>(
  algorithm: PositioningControllerAlgorithm,
  options: TAlgorithmOptions
) {
  const [targetsAndOptionsForAlgorithm, setTargetsAndOptionsForAlgorithm] =
    useState<ITargetAndOptionsForPositioningAlgorithm<TAlgorithmOptions>>({
      targets: [],
      options,
    });

  const handleOnPositioningTargetTypeChange = useCallback(
    (targetType: PositioningTargetType, enabled: boolean) => {
      window.kweenb.actions.positioning.enablePositioningControllerTargetType(
        targetType,
        enabled
      );
    },
    []
  );

  const handleOnClear = useCallback(() => {
    window.kweenb.actions.positioning.enablePositioningControllerAlgorithm(
      algorithm,
      false
    );
  }, []);

  const handleOnSelection = useCallback(() => {
    window.kweenb.actions.positioning.enablePositioningControllerAlgorithm(
      algorithm,
      true
    );
  }, []);

  const updateOptionsForAlgorithm = (
    updateOptions: Partial<TAlgorithmOptions>
  ) => {
    // set targets and options on server
    window.kweenb.actions.positioning.updatePositioningControllerAlgorithmOptions<TAlgorithmOptions>(
      algorithm,
      updateOptions
    );
  };

  useEffect(() => {
    window.kweenb.methods.positioning
      .getTargetsAndOptionsForAlgorithm<TAlgorithmOptions>(algorithm)
      .then((t) => {
        setTargetsAndOptionsForAlgorithm(() => t);
      });
  }, []);

  return {
    handleOnPositioningTargetTypeChange,
    handleOnClear,
    handleOnSelection,
    targetsAndOptionsForAlgorithm,
    updateOptionsForAlgorithm,
  };
}
