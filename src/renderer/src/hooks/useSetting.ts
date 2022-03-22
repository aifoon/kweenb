/**
 * Hook that is responsible for mutating one setting
 */

import { useCallback } from "react";
import { ISetting } from "@shared/interfaces";

export function useSetting() {
  /**
   * Updating a setting
   */
  const updateSetting = useCallback((setting: ISetting) => {
    window.kweenb.methods.updateKweenBSetting(setting);
  }, []);

  return { updateSetting };
}
