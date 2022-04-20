import React from "react";
import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBee } from "@renderer/src/hooks";

export const BeeCardWithPolling = ({
  number,
  onBeeConfigClick,
  onBeeDeleteClick,
  name,
  ipAddress,
  apiOn,
  online,
  jackIsRunning,
  jackTripIsRunning,
}: BeeCardProps) => {
  const { bee, loading } = useBee(number);
  return (
    <BeeCard
      key={number}
      number={number}
      onBeeConfigClick={onBeeConfigClick}
      onBeeDeleteClick={onBeeDeleteClick}
      loading={loading}
      name={loading ? name : bee.name}
      ipAddress={loading ? ipAddress : bee.ipAddress}
      apiOn={loading ? apiOn : bee.isApiOn}
      online={loading ? online : bee.isOnline}
      jackIsRunning={loading ? jackIsRunning : bee.status.isJackRunning}
      jackTripIsRunning={
        loading ? jackTripIsRunning : bee.status.isJacktripRunning
      }
    />
  );
};
