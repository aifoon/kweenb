import { useCallback } from "react";
import { BeeConfig, Setting } from "../interfaces";

export const useKweenB = () => {
  /**
   * Create a new bee
   */
  const createNewBee = useCallback(
    ({
      name,
      ipAddress,
    }: Pick<BeeConfig, "name" | "ipAddress">): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(() => {
          console.log(
            `Created bee with name ${name} and ipAddress ${ipAddress}`
          );
          resolve();
        }, 1000);
      }),
    []
  );

  /**
   * Update a KweenB setting
   */
  const updateSetting = useCallback(
    ({ key, value }: Setting): Promise<void> =>
      new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Updated setting with key ${key} and value ${value}`);
          resolve();
        }, 1000);
      }),
    []
  );

  return { createNewBee, updateSetting };
};
