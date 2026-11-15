import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Box, Tab, Tooltip, Typography } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import {
  BatteryIndicator,
  BeeActivity,
  SoundIndicator,
  isSound,
  WifiIndicator,
  beeActivityText,
} from "@components/Cards/BeeIndicators";
import { PageHeader } from "@components/PageHeader";
import { Tabs, TabPanel } from "@components/Tabs";
import { Z3Page } from "@components/Layout";
import { followLiveLevels } from "@renderer/src/hooks/useLiveLevels";
import { LiveLevelBar } from "../ManageBees/LiveLevelBar";
import {
  IMonitorBee,
  IMonitorEvent,
  IMonitorSnapshot,
} from "@shared/interfaces";

// how often the page asks how the swarm is doing
const REFRESH_MS = 2000;

// from this many late packets in a minute on, the sound is audibly affected
const MANY_LATE_PACKETS = 30;

const GREEN = "var(--green-status)";
const ORANGE = "var(--orange-status)";
const RED = "var(--red-status)";
const GREY = "var(--grey-400)";

/**
 * How a bee is doing, in one glance
 */

type Health = "good" | "attention" | "bad" | "resting";

interface Verdict {
  health: Health;
  // a few words
  title: string;
  // what it means and what to do
  advice: string;
}

const verdictOf = (bee: IMonitorBee): Verdict => {
  if (!bee.online)
    return {
      health: "bad",
      title: "Offline",
      advice:
        "KweenB does not hear this bee. Check that it is switched on, that its battery is charged and that it is within reach of the Wi-Fi.",
    };
  if (bee.streamState === "error")
    return {
      health: "bad",
      title: "Problem",
      advice: bee.problem || "The sound chain of this bee has a problem.",
    };
  if (bee.batteryLevel === "low")
    return {
      health: "bad",
      title: "Battery low",
      advice: "Charge this bee soon, or it will switch off.",
    };
  if (bee.streamState === "running" && bee.streamMode !== "trigger") {
    if (bee.latePacketsLastMinute >= MANY_LATE_PACKETS)
      return {
        health: "bad",
        title: "Sound is breaking up",
        advice:
          "A lot of sound arrives too late over the Wi-Fi. Move the bee closer to the router or take away what is between them.",
      };
    if (bee.latePacketsLastMinute > 0)
      return {
        health: "attention",
        title: "A few late packets",
        advice:
          "Some sound arrives late over the Wi-Fi. That is normally not heard; keep an eye on it.",
      };
  }
  if (bee.batteryLevel === "warning")
    return {
      health: "attention",
      title: "Battery running low",
      advice: "This bee will need charging before long.",
    };
  if (bee.streamState === "starting")
    return { health: "attention", title: "Starting…", advice: "" };
  if (bee.streamState === "running")
    return bee.streamMode === "trigger"
      ? {
          health: "good",
          title: "Ready for triggers",
          advice: "This bee plays its own sounds when you trigger them.",
        }
      : {
          health: "good",
          title: "Sound is clean",
          advice: "Everything arrives in time.",
        };
  return {
    health: "resting",
    title: "Standby",
    advice: "This bee is on and waits until you connect.",
  };
};

const healthColor = (health: Health): string => {
  switch (health) {
    case "good":
      return GREEN;
    case "attention":
      return ORANGE;
    case "bad":
      return RED;
    default:
      return GREY;
  }
};

const activityOf = (bee: IMonitorBee): BeeActivity => {
  if (!bee.online) return BeeActivity.Offline;
  switch (bee.streamState) {
    case "running":
      return bee.streamMode === "trigger"
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

const two = (n: number) => String(n).padStart(2, "0");

const clockTime = (time: number): string => {
  const d = new Date(time);
  return `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
};

const eventColor = (event: IMonitorEvent): string => {
  switch (event.kind) {
    case "offline":
    case "problem":
      return RED;
    case "restart":
    case "late-packets":
    case "dropouts":
    case "battery":
      return ORANGE;
    default:
      return GREEN;
  }
};

const eventText = (event: IMonitorEvent): string =>
  event.kind === "late-packets" || event.kind === "dropouts"
    ? `${event.text}: ${event.amount}`
    : event.text;

// what someone working on a show has to know about: a few late packets are
// not heard, so they are left out
const isTrouble = (event: IMonitorEvent): boolean =>
  event.kind === "late-packets"
    ? event.amount >= MANY_LATE_PACKETS
    : eventColor(event) !== GREEN;

/**
 * Pieces of the page
 */

const Dot = styled.span<{ color: string }>`
  display: inline-block;
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
`;

const Tile = styled.button<{ color: string }>`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--beeCardBg);
  border-left: 4px solid ${({ color }) => color};
  &:hover,
  &:focus-visible {
    background: var(--primary-200);
  }
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--beeCardBg);
  min-width: 0;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 1.5rem;
  line-height: 1.2;
  color: ${({ color }) => color || "inherit"};
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
`;

const Bars = styled.div<{ height: number }>`
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: ${({ height }) => height}px;
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`;

const Bar = styled.div<{ height: number; color: string }>`
  flex: 1;
  height: ${({ height }) => height}%;
  background: ${({ color }) => color};
`;

const EventRow = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--beeCardBg);
  border-left: 4px solid ${({ color }) => color};
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Choice = styled.button<{ active: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  background: ${({ active }) => (active ? "var(--primary-100)" : "none")};
  opacity: ${({ active }) => (active ? 1 : 0.7)};
  &:hover {
    opacity: 1;
  }
`;

const Summary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const BackLink = styled.button`
  all: unset;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.8;
  &:hover {
    opacity: 1;
  }
`;

/**
 * The late packets of the last half hour as small bars
 */
const History = ({
  history,
  height = 22,
}: {
  history: number[];
  height?: number;
}) => {
  const highest = Math.max(MANY_LATE_PACKETS, ...history);
  return (
    <Bars height={height}>
      {history.map((amount, index) => (
        <Bar
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          height={amount === 0 ? 0 : Math.max(12, (amount / highest) * 100)}
          // a step is 30 seconds
          color={amount * 2 >= MANY_LATE_PACKETS ? RED : ORANGE}
        />
      ))}
    </Bars>
  );
};

const Events = ({
  events,
  showBee = true,
  empty,
}: {
  events: IMonitorEvent[];
  showBee?: boolean;
  empty: string;
}) =>
  events.length === 0 ? (
    <Typography variant="small">{empty}</Typography>
  ) : (
    <EventList>
      {events.map((event) => (
        <EventRow key={event.id} color={eventColor(event)}>
          {showBee && (
            <Typography style={{ fontWeight: 600, width: 64, flex: "none" }}>
              {event.beeName}
            </Typography>
          )}
          <Typography variant="small" style={{ flex: 1 }}>
            {eventText(event)}
          </Typography>
          <Typography variant="extraSmall" style={{ opacity: 0.7 }}>
            {clockTime(event.time)}
          </Typography>
        </EventRow>
      ))}
    </EventList>
  );

/**
 * One bee in the overview
 */
const BeeTile = ({
  bee,
  onClick,
}: {
  bee: IMonitorBee;
  onClick: () => void;
}) => {
  const verdict = verdictOf(bee);
  return (
    <Tile color={healthColor(verdict.health)} onClick={onClick}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography style={{ fontWeight: 600 }}>{bee.name}</Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
          {bee.online && <SoundIndicator levelDb={bee.outputLevelDb} />}
          {bee.online && <WifiIndicator signalDbm={bee.wifiSignalDbm} />}
          {bee.online && bee.batteryPercentage !== null && (
            <BatteryIndicator
              battery={{
                present: true,
                percentage: bee.batteryPercentage,
                level: bee.batteryLevel,
                voltage: null,
              }}
            />
          )}
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Dot color={healthColor(verdict.health)} />
        <Typography variant="small">{verdict.title}</Typography>
      </Box>
      <History history={bee.history} />
    </Tile>
  );
};

/**
 * The live meter of the bee whose dashboard is open
 */
const LiveMeter = ({ beeId }: { beeId: number }) => {
  const [level, setLevel] = useState<number | null>(null);

  // only this bee is followed, and only as long as its dashboard is open
  useEffect(() => {
    followLiveLevels("dashboard", [beeId]);
    return () => followLiveLevels("dashboard", []);
  }, [beeId]);

  return (
    <Box style={{ display: level === null ? "none" : "block" }}>
      <Box display="flex" justifyContent="space-between" mb={0.5}>
        <Typography variant="extraSmall">Sound coming out, live</Typography>
        <Typography variant="extraSmall">
          {isSound(level) ? `${Math.round(level as number)} dB` : "Silent"}
        </Typography>
      </Box>
      <LiveLevelBar beeId={beeId} height={12} onLevel={setLevel} />
    </Box>
  );
};

/**
 * Everything about one bee
 */
const BeeDashboard = ({
  bee,
  events,
  onBack,
}: {
  bee: IMonitorBee;
  events: IMonitorEvent[];
  onBack: () => void;
}) => {
  const verdict = verdictOf(bee);
  const color = healthColor(verdict.health);
  const streaming =
    bee.online && bee.streamState === "running" && bee.streamMode !== "trigger";
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <BackLink onClick={onBack}>‹ All bees</BackLink>
      <Card title={`${bee.name} · ${beeActivityText(activityOf(bee))}`}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="flex-start" gap={1.5}>
            <Dot color={color} style={{ marginTop: 7 }} />
            <Box>
              <Typography style={{ fontWeight: 600 }}>
                {verdict.title}
              </Typography>
              {verdict.advice && (
                <Typography variant="small">{verdict.advice}</Typography>
              )}
            </Box>
          </Box>
          <LiveMeter beeId={bee.id} />
          <Stats>
            <Tooltip title="Sound that arrived too late over the Wi-Fi in the last minute. A few are not heard; many give clicks.">
              <Stat>
                <Typography variant="extraSmall">Late packets now</Typography>
                <StatValue
                  color={
                    streaming && bee.latePacketsLastMinute > 0
                      ? bee.latePacketsLastMinute >= MANY_LATE_PACKETS
                        ? RED
                        : ORANGE
                      : undefined
                  }
                >
                  {streaming ? bee.latePacketsLastMinute : "–"}
                </StatValue>
                <Typography variant="extraSmall">per minute</Typography>
              </Stat>
            </Tooltip>
            <Tooltip title="Measured by the bee itself, right before its speaker: a stream, a triggered sound, or both together.">
              <Stat>
                <Typography variant="extraSmall">Sound</Typography>
                <StatValue>
                  {!bee.online || bee.outputLevelDb === null
                    ? "–"
                    : isSound(bee.outputLevelDb)
                    ? `${bee.outputLevelDb} dB`
                    : "Silent"}
                </StatValue>
                <Typography variant="extraSmall">
                  {bee.online &&
                  bee.outputLevelDb !== null &&
                  isSound(bee.outputLevelDb)
                    ? "coming out of the bee"
                    : " "}
                </Typography>
              </Stat>
            </Tooltip>
            <Stat>
              <Typography variant="extraSmall">Wi-Fi</Typography>
              <Box height={29} display="flex" alignItems="center">
                {bee.online && bee.wifiSignalDbm !== null ? (
                  <WifiIndicator signalDbm={bee.wifiSignalDbm} detailed />
                ) : (
                  <StatValue>–</StatValue>
                )}
              </Box>
              <Typography variant="extraSmall">
                {bee.online && bee.wifiSignalDbm !== null
                  ? `${bee.wifiSignalDbm} dBm`
                  : " "}
              </Typography>
            </Stat>
            <Stat>
              <Typography variant="extraSmall">Battery</Typography>
              <StatValue
                color={
                  bee.batteryLevel === "low"
                    ? RED
                    : bee.batteryLevel === "warning"
                    ? ORANGE
                    : undefined
                }
              >
                {bee.online && bee.batteryPercentage !== null
                  ? `${bee.batteryPercentage}%`
                  : "–"}
              </StatValue>
              <Typography variant="extraSmall">
                {bee.batteryLevel === "low"
                  ? "low"
                  : bee.batteryLevel === "warning"
                  ? "running low"
                  : bee.batteryLevel === "safe"
                  ? "fine"
                  : " "}
              </Typography>
            </Stat>
          </Stats>
        </Box>
      </Card>
      <Card title="Late packets over the last 30 minutes">
        <History history={bee.history} height={90} />
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography variant="extraSmall">30 min ago</Typography>
          <Typography variant="extraSmall">now</Typography>
        </Box>
      </Card>
      <Card title="Since counting started">
        <Stats>
          <Stat>
            <Typography variant="extraSmall">Late packets</Typography>
            <StatValue>{bee.latePackets}</StatValue>
          </Stat>
          <Tooltip title="Moments the sound card of the bee could not keep up">
            <Stat>
              <Typography variant="extraSmall">Sound card dropouts</Typography>
              <StatValue color={bee.dropouts > 0 ? ORANGE : undefined}>
                {bee.dropouts}
              </StatValue>
            </Stat>
          </Tooltip>
          <Tooltip title="Times the bee restarted its sound chain by itself after something stopped">
            <Stat>
              <Typography variant="extraSmall">Restarts</Typography>
              <StatValue color={bee.restarts > 0 ? ORANGE : undefined}>
                {bee.restarts}
              </StatValue>
            </Stat>
          </Tooltip>
          <Stat>
            <Typography variant="extraSmall">Times offline</Typography>
            <StatValue color={bee.timesOffline > 0 ? RED : undefined}>
              {bee.timesOffline}
            </StatValue>
          </Stat>
        </Stats>
      </Card>
      <Card title={`What happened to ${bee.name}`}>
        <Events events={events} showBee={false} empty="Nothing so far." />
      </Card>
    </Box>
  );
};

/**
 * What the sound costs on the Wi-Fi
 */

// Sending many small packets costs more time on the Wi-Fi than their size
// alone: every packet waits for its turn and is acknowledged.
const AIRTIME_OVERHEAD = 2.5;

// the part of the time on the Wi-Fi a bee takes (0 - 1), null when not known
const airtimeOf = (bee: IMonitorBee): number | null =>
  bee.measuresNetwork && bee.linkMbps
    ? ((bee.receivedKbps + bee.sentKbps) / 1000 / bee.linkMbps) *
      AIRTIME_OVERHEAD
    : null;

const airtimeColor = (airtime: number): string => {
  if (airtime >= 0.7) return RED;
  return airtime >= 0.4 ? ORANGE : GREEN;
};

const mbps = (kbps: number): string => (kbps / 1000).toFixed(1);

const NetworkRow = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  display: grid;
  grid-template-columns: 60px 1fr 150px 110px 70px;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 0.85rem;
  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const Track = styled.div`
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`;

const Fill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${({ width }) => Math.min(100, width)}%;
  background: ${({ color }) => color};
`;

const Network = ({
  bees,
  onSelect,
}: {
  bees: IMonitorBee[];
  onSelect: (beeId: number) => void;
}) => {
  const measured = bees.filter((bee) => bee.measuresNetwork);
  if (measured.length === 0)
    return (
      <Typography variant="small">
        Nothing to show yet: no bee that is online tells what goes over its
        Wi-Fi.
      </Typography>
    );

  const toBees = measured.reduce((sum, bee) => sum + bee.receivedKbps, 0);
  const fromBees = measured.reduce((sum, bee) => sum + bee.sentKbps, 0);
  const packets = measured.reduce(
    (sum, bee) => sum + bee.receivedPacketsPerSecond,
    0
  );
  const airtimes = measured.map(airtimeOf);
  const airtimeKnown = airtimes.some((airtime) => airtime !== null);
  const airtime = airtimes.reduce((sum: number, a) => sum + (a || 0), 0);
  const highest = Math.max(
    1,
    ...measured.map((bee) => bee.receivedKbps + bee.sentKbps)
  );
  const totalHistory = (measured[0]?.networkHistory || []).map((_, index) =>
    measured.reduce((sum, bee) => sum + bee.networkHistory[index], 0)
  );
  const highestTotal = Math.max(1, ...totalHistory);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Stats>
        <Tooltip title="The share of the time on the Wi-Fi channel that the sound of all bees takes. A bee with a slow link needs more time for the same sound. This is an estimate; other Wi-Fi networks on the same channel are not counted.">
          <Stat>
            <Typography variant="extraSmall">Wi-Fi in use</Typography>
            <StatValue color={airtimeKnown ? airtimeColor(airtime) : undefined}>
              {airtimeKnown ? `${Math.round(airtime * 100)}%` : "–"}
            </StatValue>
            <Typography variant="extraSmall">
              {!airtimeKnown
                ? "not known"
                : airtime >= 0.7
                ? "too full: expect clicks"
                : airtime >= 0.4
                ? "getting full"
                : "plenty of room"}
            </Typography>
          </Stat>
        </Tooltip>
        <Stat>
          <Typography variant="extraSmall">To the bees</Typography>
          <StatValue>{mbps(toBees)}</StatValue>
          <Typography variant="extraSmall">Mbit/s</Typography>
        </Stat>
        <Stat>
          <Typography variant="extraSmall">Back from the bees</Typography>
          <StatValue>{mbps(fromBees)}</StatValue>
          <Typography variant="extraSmall">Mbit/s</Typography>
        </Stat>
        <Stat>
          <Typography variant="extraSmall">Packets to the bees</Typography>
          <StatValue>{packets}</StatValue>
          <Typography variant="extraSmall">per second</Typography>
        </Stat>
      </Stats>
      <Card title="All bees together over the last 30 minutes">
        <Bars height={90}>
          {totalHistory.map((kbps, index) => (
            <Bar
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              height={(kbps / highestTotal) * 100}
              color="var(--secondary-300)"
            />
          ))}
        </Bars>
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography variant="extraSmall">30 min ago</Typography>
          <Typography variant="extraSmall">
            highest: {mbps(highestTotal)} Mbit/s
          </Typography>
          <Typography variant="extraSmall">now</Typography>
        </Box>
      </Card>
      <Card title="Per bee, right now">
        <NetworkRow as="div" style={{ cursor: "default", opacity: 0.6 }}>
          <span>Bee</span>
          <span>To and from the bee</span>
          <span>Packets</span>
          <span>Link speed</span>
          <span>Wi-Fi time</span>
        </NetworkRow>
        {measured.map((bee) => {
          const beeAirtime = airtimeOf(bee);
          const kbps = bee.receivedKbps + bee.sentKbps;
          return (
            <NetworkRow key={bee.id} onClick={() => onSelect(bee.id)}>
              <span>{bee.name}</span>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box flex={1}>
                  <Track>
                    <Fill
                      width={(kbps / highest) * 100}
                      color="var(--secondary-300)"
                    />
                  </Track>
                </Box>
                <span style={{ width: 90, textAlign: "right" }}>
                  {kbps} kbit/s
                </span>
              </Box>
              <span>{bee.receivedPacketsPerSecond} per second</span>
              <span>
                {bee.linkMbps ? `${Math.round(bee.linkMbps)} Mbit/s` : "–"}
              </span>
              <span
                style={{
                  color:
                    beeAirtime !== null && beeAirtime >= 0.05
                      ? airtimeColor(beeAirtime * 5)
                      : undefined,
                }}
              >
                {beeAirtime !== null
                  ? `${(beeAirtime * 100).toFixed(1)}%`
                  : "–"}
              </span>
            </NetworkRow>
          );
        })}
      </Card>
      <Typography variant="extraSmall">
        One channel of sound is about 0.7 Mbit/s to a bee and the same back.
        What fills a Wi-Fi is not that amount but the time it takes to send it:
        a bee far from the router has a slow link and takes more of the time for
        the same sound.
      </Typography>
    </Box>
  );
};

export const Monitor = () => {
  const [snapshot, setSnapshot] = useState<IMonitorSnapshot | null>(null);
  const [tab, setTab] = useState(0);
  const [selectedBeeId, setSelectedBeeId] = useState<number | null>(null);
  const [onlyTrouble, setOnlyTrouble] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await window.kweenb.methods.getMonitoring());
    } catch (e) {
      // try again at the next refresh
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // the bees that are online come first, each group in order of number
  const bees = snapshot
    ? [...snapshot.bees].sort(
        (a, b) => Number(b.online) - Number(a.online) || a.id - b.id
      )
    : [];
  const events = snapshot ? snapshot.events : [];
  const selectedBee = bees.find((bee) => bee.id === selectedBeeId) || null;

  const count = (health: Health) =>
    bees.filter((bee) => verdictOf(bee).health === health).length;
  const shownEvents = onlyTrouble ? events.filter(isTrouble) : events;

  return (
    <Z3Page
      pageHeader={
        <PageHeader
          title="Monitor"
          subtitle={
            snapshot ? `Counting since ${clockTime(snapshot.since)}` : ""
          }
          buttons={
            <>
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Secondary}
                buttonUse={ButtonUse.Dark}
                onClick={async () => {
                  setSnapshot(await window.kweenb.methods.clearMonitoring());
                }}
              >
                Start again
              </Button>
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
                buttonUse={ButtonUse.Dark}
                onClick={() => window.kweenb.methods.saveMonitoringLog()}
              >
                Save log…
              </Button>
            </>
          }
        />
      }
    >
      <Tabs
        value={tab}
        onChange={(event: React.SyntheticEvent, value: number) => {
          setTab(value);
          setSelectedBeeId(null);
        }}
      >
        <Tab label="Bees" />
        <Tab label="Network" />
        <Tab label="Events" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        {selectedBee ? (
          <BeeDashboard
            bee={selectedBee}
            events={events.filter((event) => event.beeId === selectedBee.id)}
            onBack={() => setSelectedBeeId(null)}
          />
        ) : (
          <>
            {bees.length === 0 ? (
              <Typography variant="small">There are no bees yet.</Typography>
            ) : (
              <>
                <Summary>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Dot color={GREEN} /> {count("good")} fine
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Dot color={ORANGE} /> {count("attention")} to keep an eye
                    on
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Dot color={RED} /> {count("bad")} need you
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Dot color={GREY} /> {count("resting")} on standby
                  </Box>
                </Summary>
                <Tiles>
                  {bees.map((bee) => (
                    <BeeTile
                      key={bee.id}
                      bee={bee}
                      onClick={() => setSelectedBeeId(bee.id)}
                    />
                  ))}
                </Tiles>
              </>
            )}
          </>
        )}
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Network
          bees={bees}
          onSelect={(id) => {
            setTab(0);
            setSelectedBeeId(id);
          }}
        />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Box display="flex" gap={1} mb={2}>
          <Choice active={onlyTrouble} onClick={() => setOnlyTrouble(true)}>
            What needs you
          </Choice>
          <Choice active={!onlyTrouble} onClick={() => setOnlyTrouble(false)}>
            Everything
          </Choice>
        </Box>
        <Events
          events={shownEvents}
          empty={
            onlyTrouble
              ? "Nothing needs you. This list fills as it happens: a bee goes offline, restarts its sound chain, drops sound or runs low on battery."
              : "Nothing happened so far."
          }
        />
      </TabPanel>
    </Z3Page>
  );
};
