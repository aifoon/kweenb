import { useCallback, useMemo, useRef } from "react";
import { IBee } from "@shared/interfaces";
import { BeeCard, BeeCardProps } from "@components/Cards/BeeCard";
import { useBeeStore } from "@renderer/src/hooks";
import { ChannelType } from "@shared/enums";
import { useLiveMetersSwitch } from "@renderer/src/hooks/useLiveLevels";
import { LiveLevelBar } from "./LiveLevelBar";

// what is shown as long as the bee is not known
const UNKNOWN_BEE: IBee = {
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
};

export const BeeCardWithPolling = (props: BeeCardProps) => {
  const { number, collapsed } = props;
  // the bee itself: the store keeps the same object as long as the bee did
  // not change, so the card is only drawn again when it did
  const bee =
    useBeeStore((state) => state.bees.find((b) => b.id === number)) ||
    UNKNOWN_BEE;
  const liveMeters = useLiveMetersSwitch((state) => state.on);

  // the card gets the same functions every time (they call the newest ones)
  const latest = useRef(props);
  latest.current = props;
  const onBeeConfigClick = useCallback<BeeCardProps["onBeeConfigClick"]>(
    (e) => latest.current.onBeeConfigClick(e),
    []
  );
  const onBeeDeleteClick = useCallback<BeeCardProps["onBeeDeleteClick"]>(
    (e) => latest.current.onBeeDeleteClick(e),
    []
  );
  const onDoubleClick = useCallback<NonNullable<BeeCardProps["onDoubleClick"]>>(
    (e) => latest.current.onDoubleClick?.(e),
    []
  );

  const showMeter = liveMeters && bee.isOnline;
  const liveMeter = useMemo(
    () => (showMeter ? <LiveLevelBar beeId={number} /> : null),
    [showMeter, number]
  );

  return (
    <BeeCard
      number={number}
      onBeeConfigClick={onBeeConfigClick}
      onBeeDeleteClick={onBeeDeleteClick}
      name={bee.name}
      ipAddress={bee.ipAddress}
      apiOn={bee.isApiOn}
      online={bee.isOnline}
      monitoring={bee.monitoring}
      liveMeter={liveMeter}
      onDoubleClick={onDoubleClick}
      collapsed={collapsed}
    />
  );
};
