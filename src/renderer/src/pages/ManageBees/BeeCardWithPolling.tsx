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
      name={bee.name}
      ipAddress={bee.ipAddress}
      apiOn={bee.isApiOn}
      online={bee.isOnline}
      jackIsRunning={bee.status.isJackRunning}
      jackTripIsRunning={bee.status.isJacktripRunning}
    />
  );
};
