import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import styled from "styled-components";

export enum NetworkPerformancePresentationType {
  SIMPLE,
  DETAILED,
}

enum NetworkPerformanceStatus {
  OFFLINE = "offline",
  GOOD = "good",
  OK = "ok",
  BAD = "bad",
}

interface NetworkPerformanceProps {
  networkPerformanceMs: number;
  networkPresentationType: NetworkPerformancePresentationType;
}

const NetworkPerformanceContainer = styled.div<{
  networkPerformanceStatus: NetworkPerformanceStatus;
}>`
  background-color: ${(props) => {
    switch (props.networkPerformanceStatus) {
      case NetworkPerformanceStatus.GOOD:
        return "var(--green-status)";
      case NetworkPerformanceStatus.OK:
        return "var(--yellow-status)";
      case NetworkPerformanceStatus.BAD:
        return "var(--red-status)";
      default:
        return "var(--grey-400)";
    }
  }};
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  margin: 0;
  border: none;
`;

const getNetworkStatus = (networkPerformanceMs: number) => {
  if (networkPerformanceMs === 0) {
    return NetworkPerformanceStatus.OFFLINE;
  } else if (networkPerformanceMs < 50) {
    return NetworkPerformanceStatus.GOOD;
  } else if (networkPerformanceMs < 150) {
    return NetworkPerformanceStatus.OK;
  } else {
    return NetworkPerformanceStatus.BAD;
  }
};

export const NetworkPerformance = ({
  networkPerformanceMs,
  networkPresentationType = NetworkPerformancePresentationType.SIMPLE,
}: NetworkPerformanceProps) => {
  const [currentNetworkPerformanceMs, setCurrentNetworkPerformanceMs] =
    React.useState<number>(networkPerformanceMs);

  useEffect(() => {
    setCurrentNetworkPerformanceMs(networkPerformanceMs);
  }, [networkPerformanceMs]);

  return (
    <>
      {currentNetworkPerformanceMs > 0 && (
        <NetworkPerformanceContainer
          networkPerformanceStatus={getNetworkStatus(networkPerformanceMs)}
        >
          {networkPresentationType ===
            NetworkPerformancePresentationType.SIMPLE && (
            <div>{getNetworkStatus(networkPerformanceMs)}</div>
          )}
          {networkPresentationType ===
            NetworkPerformancePresentationType.DETAILED && (
            <Typography display={"block"} variant="extraSmall">
              {currentNetworkPerformanceMs >= 999 && <>Very Slow</>}
              {currentNetworkPerformanceMs < 999 && (
                <>{currentNetworkPerformanceMs} ms</>
              )}
            </Typography>
          )}
        </NetworkPerformanceContainer>
      )}
    </>
  );
};
