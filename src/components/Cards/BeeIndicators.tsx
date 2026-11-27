import styled, { keyframes } from "styled-components";
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

// a battery that is charging breathes slowly
const chargingPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

// as wide as the battery that is not charging; the bolt sticks out above
// and below, which the margins take back so the row keeps its height
const ChargingSvg = styled.svg`
  flex: none;
  width: 25px;
  height: 16px;
  margin: -3px 0;
  animation: ${chargingPulse} 2.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/**
 * About how long something still takes, in words
 */
export const aboutMinutes = (minutes: number): string => {
  if (minutes < 60) return `about ${Math.max(5, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `about ${hours} h` : `about ${hours} h ${rest} min`;
};

/**
 * What a charging battery tells: "Charging, about 40 min to go"
 */
export const chargingText = (
  minutesToFull: number | null | undefined
): string => {
  if (minutesToFull === null || minutesToFull === undefined) return "Charging";
  return minutesToFull <= 0
    ? "Charging, almost full"
    : `Charging, ${aboutMinutes(minutesToFull)} to go`;
};

// A battery that is charging: "battery-charging-outline" of Ionicons
// (MIT licence, https://ionic.io/ionicons)
const ChargingBattery = ({ color }: { color: string }) => (
  <ChargingSvg viewBox="16 104 480 304" fill={color} aria-hidden="true">
    <path d="M48 322.3V189.7A29.74 29.74 0 0177.7 160h137.44l24.4-32H77.7A61.77 61.77 0 0016 189.7v132.6A61.77 61.77 0 0077.7 384h96.85a22.57 22.57 0 01.26-7.32l.15-.75.21-.73 6.5-23.2H77.7A29.74 29.74 0 0148 322.3zM386.3 128h-98.64a22.69 22.69 0 01-.27 7.2l-.15.74-.21.73-6.54 23.33H386.3a29.74 29.74 0 0129.7 29.7v132.6a29.74 29.74 0 01-29.7 29.7H247l-24.42 32H386.3a61.77 61.77 0 0061.7-61.7V189.7a61.77 61.77 0 00-61.7-61.7z" />
    <path d="M162.65 294.16a24.37 24.37 0 01-21.56-13 25 25 0 011.42-25.83l.31-.46.33-.44L197.62 183H89.69a20 20 0 00-20 20v106a20 20 0 0020 20h98.42l9.78-34.86z" />
    <path d="M276.07 280.89l27.07-35.49a5.2 5.2 0 00.77-1.91 5 5 0 00.08-.66 5 5 0 00-.08-1.29 5.11 5.11 0 00-.68-1.75 4.76 4.76 0 00-.78-.95 3.48 3.48 0 00-.48-.38 4 4 0 00-1.11-.55 4.28 4.28 0 00-1.31-.2h-61.62l12.12-43.21 3.23-11.5 6.21-22.16.51-1.84 7.79-27.76a3.51 3.51 0 00.05-.55v-.16c0-.05 0-.26-.05-.38s0-.09 0-.14a2.2 2.2 0 00-.17-.45 3.77 3.77 0 00-.26-.39l-.09-.1a2.73 2.73 0 00-.25-.23l-.1-.08a3.14 3.14 0 00-.39-.24 2 2 0 00-.41-.14H265.53a2.3 2.3 0 00-.45 0 1.9 1.9 0 00-.42.15l-.13.07-.3.21-.11.1a2.4 2.4 0 00-.36.41l-18 23.63-13.14 17.22-9.85 12.83-63.71 83.55a5.72 5.72 0 00-.44.8 4.78 4.78 0 00-.35 1.09 4.7 4.7 0 00-.08 1.29 4.86 4.86 0 002 3.71 4.74 4.74 0 00.54.31 4.31 4.31 0 001.89.43h61.62L194.42 380.6a3.64 3.64 0 000 .56v.15a2.32 2.32 0 00.06.38.58.58 0 000 .14 2.2 2.2 0 00.17.45 3.62 3.62 0 00.26.38l.09.1.25.24a.39.39 0 01.1.08 2.22 2.22 0 00.39.23 2.83 2.83 0 00.41.14h.13a1.86 1.86 0 00.33 0h.13a2.32 2.32 0 00.45-.06 2.05 2.05 0 00.41-.16l.13-.07.3-.21.11-.09a2.4 2.4 0 00.36-.41L221.82 352l17.53-23z" />
    <path d="M319.5 256.93l-.46.6L264.51 329h109.8a20 20 0 0020-20V203a20 20 0 00-20-20H274.05l-9.74 34.73h35.24A24.35 24.35 0 01321 230.5a25.21 25.21 0 01-1 25.79zM480 202.67a16 16 0 00-16 16v74.66a16 16 0 0032 0v-74.66a16 16 0 00-16-16z" />
  </ChargingSvg>
);

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

  // a full battery is full: no bolt and no pulsing, also on its charger
  const full = battery.percentage !== null && battery.percentage >= 100;
  const charging = Boolean(battery.charging) && !full;
  // a battery on its charger is on its way up: no warning colour
  const color = charging ? "var(--green-status)" : batteryColor(battery.level);
  const known = battery.percentage !== null;
  const text = known
    ? `${battery.percentage}%`
    : battery.voltage !== null
    ? `${battery.voltage.toFixed(1)} V`
    : "?";
  const explanation = charging
    ? chargingText(battery.minutesToFull)
    : full
    ? "Battery is full"
    : battery.level === "low"
    ? "Battery is low"
    : battery.level === "warning"
    ? "Battery is running low"
    : known
    ? "Battery is fine"
    : "Battery level is not known yet";

  return (
    <Tooltip title={explanation}>
      <Box display="flex" alignItems="center" gap={0.75}>
        {charging ? (
          <ChargingBattery color={color} />
        ) : (
          <BatteryShell color={color}>
            <BatteryFill color={color} percentage={battery.percentage ?? 100} />
          </BatteryShell>
        )}
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
