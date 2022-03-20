/**
 * Hook that will check the status of a bee
 */

import { useEffect, useState } from "react";
import { useInterval } from "./useInterval";

export function useBeeStatus(id: number) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isJackRunning, setIsJackRunning] = useState<boolean>(false);
  const [isJacktripRunning, setIsJacktripRunning] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    // @TODO fetch the bee status from zwerm3api when mounting
    setTimeout(() => {
      setIsJackRunning(false);
      setIsJacktripRunning(false);
      setLoading(false);
    }, 1000);
  }, []);

  useInterval(() => {
    setIsJackRunning(true);
    setIsJacktripRunning(false);
  }, 1000);

  return { loading, isJackRunning, isJacktripRunning };
}

export default useBeeStatus;
