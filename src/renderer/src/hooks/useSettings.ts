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

  /**
   * When mouting, listen for imported settings
   */
  useEffect(() => {
    const removeEventListener = window.kweenb.events.onImportedSettings(
      async () => {
        setLoading(true);
        await reloadSettings();
        setLoading(false);
      }
    );
    return () => removeEventListener();
  }, []);

  return { loading, settings, updateSetting, reloadSettings };
}
