/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { IKweenBSettings, ISetting } from "@shared/interfaces";

export function useSettings() {
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<IKweenBSettings>();

  /**
   * Updating a setting
   */
  const updateSetting = useCallback((setting: ISetting) => {
    window.kweenb.methods.updateKweenBSetting(setting);
  }, []);

  /**
   * When mounting, fetch all the settings
   */
  useEffect(() => {
    // fetch the settings
    (async () => {
      setLoading(true);
      const kweenBSettings = await window.kweenb.methods.fetchKweenBSettings();
      setSettings(kweenBSettings);
      setLoading(false);
    })();
  }, []);

  return { loading, settings, updateSetting };
}
