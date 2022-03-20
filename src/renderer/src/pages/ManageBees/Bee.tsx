import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBeeStatus } from "@renderer/src/hooks";
import React from "react";

type BeeProps = Pick<
  BeeCardProps,
  "onBeeConfigClick" | "number" | "ipAddress" | "name" | "online"
>;

export const Bee = ({
  number = 0,
  onBeeConfigClick,
  name,
  ipAddress,
  online,
}: BeeProps) => {
  const {
    loading: beeStatusLoading,
    isJackRunning,
    isJacktripRunning,
  } = useBeeStatus(number);
  return (
    <BeeCard
      number={number}
      onBeeConfigClick={onBeeConfigClick}
      name={name}
      ipAddress={ipAddress}
      loading={beeStatusLoading}
      online={online}
      jackIsRunning={isJackRunning}
      jackTripIsRunning={isJacktripRunning}
    />
  );
};
