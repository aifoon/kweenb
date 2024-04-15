/**
 * Hook that is responsible for mutating one setting
 */

import { useCallback } from "react";
import { ISetting } from "@shared/interfaces";

export function useSetting() {
  /**
   * Updating a setting
   */
  const updateSetting = useCallback(
    async (setting: ISetting): Promise<void> => {
      await window.kweenb.methods.updateSetting(setting);
    },
    []
  );

  /**
   * Sets the Jack folder path
   */
  const setJackFolderPath = useCallback((jackFolderPath) => {
    window.kweenb.actions.setJackFolderPath(jackFolderPath);
  }, []);

  /**
   * Sets the Jacktrip binary path
   */
  const setJacktripBinPath = useCallback((jacktripBinPath) => {
    window.kweenb.actions.setJacktripBinPath(jacktripBinPath);
  }, []);

  return { updateSetting, setJackFolderPath, setJacktripBinPath };
}
