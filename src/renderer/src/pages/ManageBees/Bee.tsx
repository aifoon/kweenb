import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBeeConfig, useBeeStatus } from "@renderer/src/hooks";
import React from "react";

type BeeProps = Pick<BeeCardProps, "onBeeConfigClick" | "number">;

export const Bee = ({ number = 0, onBeeConfigClick }: BeeProps) => {
  const {
    loading: beeStatusLoading,
    isOnline,
    isJackRunning,
    isJacktripRunning,
  } = useBeeStatus(number);
  const { loading: beeConfigLoading, beeConfig } = useBeeConfig(number, {
    ipAddress: "Loading...",
    name: "Loading...",
    jacktripVersion: "",
    useMqtt: false,
  });
  const { name, ipAddress } = beeConfig;
  return (
    <BeeCard
      number={number}
      onBeeConfigClick={onBeeConfigClick}
      name={name}
      ipAddress={ipAddress}
      loading={beeStatusLoading || beeConfigLoading}
      online={isOnline}
      jackIsRunning={isJackRunning}
      jackTripIsRunning={isJacktripRunning}
    />
  );
};
