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

/**
 * The band of a Wi-Fi frequency in a few letters ("6G"), empty when not known
 */
export const wifiBand = (frequencyMhz?: number | null): string => {
  if (!frequencyMhz) return "";
  if (frequencyMhz >= 5925) return "6G";
  if (frequencyMhz >= 4900) return "5G";
  return "2.4G";
};

interface WifiIndicatorProps {
  signalDbm?: number | null;
  // the frequency of the network the bee is on, when the bee tells
  frequencyMhz?: number | null;
  // show the words next to the bars
  detailed?: boolean;
}

export const WifiIndicator = ({
  signalDbm,
  frequencyMhz,
  detailed = false,
}: WifiIndicatorProps) => {
  if (signalDbm === null || signalDbm === undefined) return null;
  const bars = wifiBars(signalDbm);
  const band = wifiBand(frequencyMhz);

  return (
    <Tooltip
      title={`${wifiText(bars)} (${signalDbm} dBm${
        band ? `, on the ${band.replace("G", " GHz")} network` : ""
      })`}
    >
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
        {!detailed && band && (
          <Typography variant="extraSmall" style={{ lineHeight: 1 }}>
            {band}
          </Typography>
        )}
        {detailed && (
          <Typography variant="extraSmall">
            {wifiText(bars)}
            {band ? ` · ${band}` : ""}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

/**
 * Sound: is sound coming out of the bee, and how loud. The bee measures it
 * itself, so it is true for a stream, a triggered sound and both together.
 */

// Below this the bee is silent. A bee that plays nothing tells exactly
// -100 (no signal at all), so the line is drawn low: also sound that is
// played softly has to show as sound.
export const SILENCE_DB = -90;

/**
 * Is this level sound (and not silence)
 */
export const isSound = (levelDb: number | null | undefined): boolean =>
  levelDb !== null && levelDb !== undefined && levelDb > SILENCE_DB;

/**
 * How far a level fills a meter (0 - 100): from silence to the loudest
 */
export const levelFill = (levelDb: number): number =>
  Math.max(0, Math.min(100, ((levelDb - SILENCE_DB) / -SILENCE_DB) * 100));

const SoundTrack = styled.div`
  width: 26px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
`;

const SoundFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
  transition: width 0.4s;
`;

interface SoundIndicatorProps {
  // the loudest of the last seconds in dB below full scale, null when the
  // bee does not tell
  levelDb?: number | null;
  // show the words next to the bar
  detailed?: boolean;
}

export const SoundIndicator = ({
  levelDb,
  detailed = false,
}: SoundIndicatorProps) => {
  // a bee that does not tell shows nothing
  if (levelDb === null || levelDb === undefined) return null;
  const playing = isSound(levelDb);
  const fill = playing ? Math.max(8, levelFill(levelDb)) : 0;
  let color = "var(--green-status)";
  // the bee tells the average level, not the peaks: a tone at full scale
  // reads -3 dB, music that clips reads lower still
  if (levelDb >= -3) color = "var(--red-status)";
  else if (levelDb >= -12) color = "var(--orange-status)";
  const text = playing ? "Sound is coming out" : "Silent";

  return (
    <Tooltip title={playing ? `${text} (${levelDb} dB)` : text}>
      <Box display="flex" alignItems="center" gap={0.75}>
        <SoundTrack>
          <SoundFill width={fill} color={color} />
        </SoundTrack>
        {detailed && <Typography variant="extraSmall">{text}</Typography>}
      </Box>
    </Tooltip>
  );
};
