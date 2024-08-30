import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBee } from "@renderer/src/hooks";
import { ChannelType } from "@shared/enums";

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
  const { bee } = useBee(number);
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
      networkPerformanceMs={bee.networkPerformanceMs}
      jackTripIsRunning={bee.status.isJacktripRunning}
      onDoubleClick={onDoubleClick}
      onChannelTypeChange={(channelType: ChannelType) =>
        console.log("ok", channelType)
      }
      collapsed={collapsed}
    />
  );
};
