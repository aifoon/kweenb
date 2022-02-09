import { useEffect, useState } from "react";
import { useInterval } from "./useInterval";

export function useBeeStatus(id: number) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isJackRunning, setIsJackRunning] = useState<boolean>(false);
  const [isJacktripRunning, setIsJacktripRunning] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    // @TODO fetch the bee status from zwerm3api when mounting
    setTimeout(() => {
      setIsOnline(false);
      setIsJackRunning(false);
      setIsJacktripRunning(false);
      setLoading(false);
    }, 1000);
  }, []);

  useInterval(() => {
    setIsOnline(true);
    setIsJackRunning(true);
    setIsJacktripRunning(false);
  }, 1000);

  return { loading, isOnline, isJackRunning, isJacktripRunning };
}

export default useBeeStatus;
