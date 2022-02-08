import { useCallback } from "react";
import { BeeConfig } from "../interfaces";

export const useBeeDatabase = () => {
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

  return { createNewBee };
};
