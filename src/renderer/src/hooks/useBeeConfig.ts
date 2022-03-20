/**
 * Hook that will fetch the internal configuration of the bee
 */

import { useCallback, useEffect, useState } from "react";
import { BeeConfig, BeeConfigItem } from "../interfaces";

export function useBeeConfig(
  id: number,
  defaultConfig: BeeConfig = {
    jacktripVersion: "",
    useMqtt: false,
  }
) {
  const [loading, setLoading] = useState<boolean>(true);
  const [beeConfig, setBeeConfig] = useState<BeeConfig>(defaultConfig);

  /**
   * Fetch the Bee Configuration from zwerm3api
   */
  const fetchBeeConfig = useCallback(async () => {
    setLoading(true);

    // @TODO fetch the bee config from zwerm3api
    setTimeout(() => {
      setBeeConfig({
        jacktripVersion: "1.4.1",
        useMqtt: true,
      });

      setLoading(false);
    }, 1000);
  }, [id]);

  /**
   * Update the Bee Config
   */
  const updateBeeConfig = ({ key, value }: BeeConfigItem) => {
    console.log(`Updating ${key} with value ${value}`);
  };

  /**
   * When mounting, fetch the bee config
   */
  useEffect(() => {
    fetchBeeConfig();
  }, [fetchBeeConfig]);

  return { loading, beeConfig, updateBeeConfig };
}

export default useBeeConfig;
