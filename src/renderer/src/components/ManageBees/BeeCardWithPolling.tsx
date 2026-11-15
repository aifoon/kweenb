import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBeeStore } from "@renderer/src/hooks";
import { ChannelType } from "@shared/enums";
import { useLiveMetersSwitch } from "@renderer/src/hooks/useLiveLevels";
import { LiveLevelBar } from "./LiveLevelBar";

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
  const { bee } = useBeeStore((state) => ({
    bee: state.bees.find((bee) => bee.id === number) || {
      id: 0,
      name: "...",
      ipAddress: "...",
      isOnline: false,
      isApiOn: false,
      isActive: false,
      channel1: 0,
      channel2: 0,
      networkPerformanceMs: 0,
      channelType: ChannelType.MONO,
      status: {
        isJackRunning: false,
        isJacktripRunning: false,
      },
    },
  }));
  const liveMeters = useLiveMetersSwitch((state) => state.on);
  return (
    <BeeCard
      key={number}
      number={number}
      onBeeConfigClick={onBeeConfigClick}
      onBeeDeleteClick={onBeeDeleteClick}
      name={bee.name}
      ipAddress={bee.ipAddress}
      apiOn={bee.isApiOn}
      online={bee.isOnline}
      channelType={ChannelType.MONO}
      channel1={1}
      channel2={2}
      jackIsRunning={bee.status.isJackRunning}
      monitoring={bee.monitoring}
      liveMeter={
        liveMeters && bee.isOnline ? <LiveLevelBar beeId={number} /> : null
      }
      jackTripIsRunning={bee.status.isJacktripRunning}
      onDoubleClick={onDoubleClick}
      onChannelTypeChange={(channelType: ChannelType) =>
        console.log("ok", channelType)
      }
      collapsed={collapsed}
    />
  );
};
