import { PositioningControllerAlgorithm, PositioningTargetType } from "@shared/interfaces";
import { useCallback, useEffect, useState } from "react";

export function usePositioningTargetSelector(algorithm: PositioningControllerAlgorithm) {
   const [hasSelection, setHasSelection] = useState(false);

  const handleOnPositioningTargetTypeChange = useCallback((targetType: PositioningTargetType, enabled: boolean) => {
    window.kweenb.actions.positioning.enablePositioningControllerTargetType(targetType, enabled);
  }, []);

  const handleOnClear = useCallback(() => {
    setHasSelection(false);
  },[]);

  const handleOnSelection = useCallback(() => {
    setHasSelection(true);
  }, []);

  useEffect(() => {
    window.kweenb.actions.positioning.enablePositioningControllerAlgorithm(
      algorithm,
      hasSelection
    );
  }, [hasSelection]);

  return {
    handleOnPositioningTargetTypeChange,
    handleOnClear,
    handleOnSelection,
  }
}