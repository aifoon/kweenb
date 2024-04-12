import { useCallback, useEffect, useState } from "react";
import { IBeeConfig } from "shared/interfaces";

export function useBeeConfig(id: number) {
  const [beeConfig, setBeeConfig] = useState<IBeeConfig>({
    useMqtt: false,
    mqttBroker: "",
    mqttChannel: "",
    device: "",
  });

  /**
   * Fetch bee config
   */
  const fetchBeeConfig = useCallback(async () => {
    const fetchedBeeConfig = await window.kweenb.methods.getBeeConfig(id);
    setBeeConfig(fetchedBeeConfig);
  }, []);

  useEffect(() => {
    fetchBeeConfig();
  }, []);

  return { beeConfig };
}
