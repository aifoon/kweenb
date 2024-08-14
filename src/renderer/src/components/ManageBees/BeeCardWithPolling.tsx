import React from "react";
import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBee } from "@renderer/src/hooks";
import { ChannelType } from "@shared/interfaces";

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
  collapsed,
  onDoubleClick,
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
      channelType={ChannelType.MONO}
      channel1={1}
      channel2={2}
      jackIsRunning={loading ? jackIsRunning : bee.status.isJackRunning}
      networkPerformanceMs={loading ? 0 : bee.networkPerformanceMs}
      jackTripIsRunning={
        loading ? jackTripIsRunning : bee.status.isJacktripRunning
      }
      onDoubleClick={onDoubleClick}
      onChannelTypeChange={(channelType: ChannelType) =>
        console.log("ok", channelType)
      }
      collapsed={collapsed}
    />
  );
};
