import { useState } from "react";
import { useInterval } from "./useInterval";

export function useBeeStatus(id: number) {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isJackRunning, setIsJackRunning] = useState<boolean>(false);
  const [isJacktripRunning, setIsJacktripRunning] = useState<boolean>(false);

  useInterval(() => {
    setIsOnline(false);
    setIsJackRunning(false);
    setIsJacktripRunning(true);
  }, 1000);

  return { isOnline, isJackRunning, isJacktripRunning };
}

export default useBeeStatus;
