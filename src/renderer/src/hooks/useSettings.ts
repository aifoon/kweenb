/**
 * Hook that will get the data, stored in our sqlite database
 */

import { useCallback, useEffect, useState } from "react";
import { ISettings, ISetting } from "@shared/interfaces";

export function useSettings() {
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<ISettings>();

  /**
   * Updating a setting
   */
  const updateSetting = useCallback((setting: ISetting) => {
    window.kweenb.methods.updateSetting(setting);
  }, []);

  /**
   * Reload settings
   */
  const reloadSettings = useCallback(async () => {
    setLoading(true);
    const kweenBSettings = await window.kweenb.methods.fetchSettings();
    setSettings(kweenBSettings);
    setLoading(false);
  }, []);

  /**
   * When mounting, fetch all the settings
   */
  useEffect(() => {
    // fetch the settings
    (async () => {
      setLoading(true);
      const kweenBSettings = await window.kweenb.methods.fetchSettings();
      setSettings(kweenBSettings);
      setLoading(false);
    })();
  }, []);

  return { loading, settings, updateSetting, reloadSettings };
}
