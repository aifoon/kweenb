import React from "react";
import styled from "styled-components";
import { Box, Tooltip, Typography } from "@mui/material";
import { IBeeMonitoring } from "../../shared/interfaces";

/**
 * What a bee is doing, in the words of someone working on a show
 */

export enum BeeActivity {
  Offline,
  Standby,
  Starting,
  Streaming,
  ReadyForTriggers,
  Problem,
}

export const getBeeActivity = (
  online: boolean,
  monitoring?: IBeeMonitoring
): BeeActivity => {
  if (!online) return BeeActivity.Offline;
  switch (monitoring?.stream.state) {
    case "running":
      return monitoring.stream.mode === "trigger"
        ? BeeActivity.ReadyForTriggers
        : BeeActivity.Streaming;
    case "starting":
      return BeeActivity.Starting;
    case "error":
      return BeeActivity.Problem;
    default:
      return BeeActivity.Standby;
  }
};

/**
 * The colour that tells how a bee is doing: green is fine, orange asks for
 * an eye on it, red needs you, grey is resting
 */
export const beeHealthColor = (
  activity: BeeActivity,
  batteryLevel?: string | null
): string => {
  if (activity === BeeActivity.Offline || activity === BeeActivity.Problem)
    return "var(--red-status)";
  if (batteryLevel === "low") return "var(--red-status)";
  if (activity === BeeActivity.Starting || batteryLevel === "warning")
    return "var(--orange-status)";
  if (activity === BeeActivity.Standby) return "var(--grey-400)";
  return "var(--green-status)";
};

export const beeActivityText = (activity: BeeActivity): string => {
  switch (activity) {
    case BeeActivity.Offline:
      return "Offline";
    case BeeActivity.Starting:
      return "Starting…";
    case BeeActivity.Streaming:
      return "Streaming";
    case BeeActivity.ReadyForTriggers:
      return "Ready for triggers";
    case BeeActivity.Problem:
      return "Problem";
    default:
      return "Standby";
  }
};

/**
 * Battery: green in the safe zone, orange when running low, red when low
 */

const batteryColor = (level: string | null) => {
  switch (level) {
    case "safe":
      return "var(--green-status)";
    case "warning":
      return "var(--orange-status)";
    case "low":
      return "var(--red-status)";
    default:
      return "var(--grey-400)";
  }
};

const BatteryShell = styled.div<{ color: string }>`
  position: relative;
  width: 22px;
  height: 11px;
  border: 1.5px solid ${({ color }) => color};
  border-radius: 3px;
  box-sizing: border-box;

  &::after {
    content: "";
    position: absolute;
    right: -4px;
    top: 2px;
    width: 2px;
    height: 4px;
    border-radius: 0 1px 1px 0;
    background-color: ${({ color }) => color};
  }
`;

const BatteryFill = styled.div<{ color: string; percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => Math.max(8, Math.min(100, percentage))}%;
  background-color: ${({ color }) => color};
`;

interface BatteryIndicatorProps {
  battery?: IBeeMonitoring["battery"];
  // show "Battery 85%" instead of "85%"
  detailed?: boolean;
}

export const BatteryIndicator = ({
  battery,
  detailed = false,
}: BatteryIndicatorProps) => {
  // a bee without a battery sensor shows nothing
  if (!battery || !battery.present) return null;

  const color = batteryColor(battery.level);
  const known = battery.percentage !== null;
  const text = known
    ? `${battery.percentage}%`
    : battery.voltage !== null
    ? `${battery.voltage.toFixed(1)} V`
    : "?";
  const explanation =
    battery.level === "low"
      ? "Battery is low"
      : battery.level === "warning"
      ? "Battery is running low"
      : known
      ? "Battery is fine"
      : "Battery level is not known yet";

  return (
    <Tooltip title={explanation}>
      <Box display="flex" alignItems="center" gap={0.75}>
        <BatteryShell color={color}>
          <BatteryFill color={color} percentage={battery.percentage ?? 100} />
        </BatteryShell>
        <Typography variant="extraSmall">
          {detailed ? `Battery ${text}` : text}
        </Typography>
      </Box>
    </Tooltip>
  );
};

/**
 * Wi-Fi: how well the bee hears the access point
 */

const wifiBars = (signalDbm: number): number => {
  if (signalDbm >= -55) return 4;
  if (signalDbm >= -65) return 3;
  if (signalDbm >= -75) return 2;
  return 1;
};

const wifiText = (bars: number): string =>
  ["", "Wi-Fi weak", "Wi-Fi fair", "Wi-Fi good", "Wi-Fi strong"][bars];

const WifiBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 11px;
`;

const WifiBar = styled.div<{ active: boolean; index: number; weak: boolean }>`
  width: 3px;
  height: ${({ index }) => 3 + index * 2.6}px;
  border-radius: 1px;
  background-color: ${({ active, weak }) => {
    if (!active) return "var(--grey-400)";
    return weak ? "var(--orange-status)" : "var(--green-status)";
  }};
`;

interface WifiIndicatorProps {
  signalDbm?: number | null;
  // show the words next to the bars
  detailed?: boolean;
}

export const WifiIndicator = ({
  signalDbm,
  detailed = false,
}: WifiIndicatorProps) => {
  if (signalDbm === null || signalDbm === undefined) return null;
  const bars = wifiBars(signalDbm);

  return (
    <Tooltip title={`${wifiText(bars)} (${signalDbm} dBm)`}>
      <Box display="flex" alignItems="center" gap={0.75}>
        <WifiBars>
          {[0, 1, 2, 3].map((index) => (
            <WifiBar
              key={index}
              index={index}
              active={index < bars}
              weak={bars <= 1}
            />
          ))}
        </WifiBars>
        {detailed && (
          <Typography variant="extraSmall">{wifiText(bars)}</Typography>
        )}
      </Box>
    </Tooltip>
  );
};
