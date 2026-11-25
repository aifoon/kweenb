/**
 * Keeps track of how the swarm is doing while KweenB runs: per bee the late
 * packets and dropouts over the last half hour, and a list of what happened
 * (a bee went offline, its sound chain restarted, its battery ran low, ...).
 *
 * Nothing in here needs Electron, so it can be tested on its own.
 */

import {
  BeeBatteryLevel,
  BeeStreamMode,
  BeeStreamState,
  IMonitorBee,
  IMonitorEvent,
  IMonitorSnapshot,
  MonitorEventKind,
} from "@shared/interfaces";

// the history is kept in steps of 30 seconds, for half an hour
export const MONITOR_STEP_MS = 30 * 1000;
export const MONITOR_STEPS = 60;

// a stream that just started is given this long before what it reports counts
const SETTLE_SECONDS = 14;

// events of the same kind on the same bee within a minute are counted together
const MERGE_EVENTS_MS = 60 * 1000;

// the list of events does not grow forever
const MAX_EVENTS = 1000;

// what the monitor needs out of the status a bee sends
export interface MonitorStatus {
  stream: {
    state: BeeStreamState;
    mode: BeeStreamMode | null;
    error: string | null;
    restarts: number;
    xruns: number;
    glitches: number;
    // how long the stream runs, when the bee tells
    runningSeconds?: number;
  };
  battery: { percentage: number | null; level: BeeBatteryLevel | null };
  wifiSignalDbm: number | null;
  wifiFrequencyMhz?: number | null;
  outputLevelDb?: number | null;
  // what went over the Wi-Fi of the bee since it started
  network?: {
    receivedBytes: number;
    receivedPackets: number;
    sentBytes: number;
    sentPackets: number;
    linkMbps: number | null;
  } | null;
}

// what went over the Wi-Fi of a bee between two of its status messages
interface Traffic {
  time: number;
  seconds: number;
  receivedBytes: number;
  sentBytes: number;
  receivedPackets: number;
}

// the traffic of the last seconds tells the speed of right now
const TRAFFIC_WINDOW_MS = 10 * 1000;

interface Step {
  // the number of the step: time / MONITOR_STEP_MS
  index: number;
  latePackets: number;
  dropouts: number;
  // sent and received together, and over how many seconds that was measured
  bytes: number;
  seconds: number;
}

interface TrackedBee {
  id: number;
  name: string;
  online: boolean;
  // false until the bee was seen for the first time
  seen: boolean;
  last: MonitorStatus | null;
  steps: Step[];
  // the moments (and amounts) of the late packets of the last minute
  recentLatePackets: { time: number; amount: number }[];
  // the network counters of the last status, and what was measured with them
  network: (NonNullable<MonitorStatus["network"]> & { time: number }) | null;
  traffic: Traffic[];
  latePackets: number;
  dropouts: number;
  restarts: number;
  timesOffline: number;
}

/**
 * How much a counter of a bee went up. The counters of a bee start again at
 * zero when its sound chain starts again.
 */
export const counterIncrease = (before: number, now: number): number =>
  now >= before ? now - before : now;

const streamModeNames: Record<BeeStreamMode, string> = {
  hub: "hub",
  p2p: "P2P",
  trigger: "trigger only",
};

class SwarmMonitor {
  private bees = new Map<number, TrackedBee>();
  private events: IMonitorEvent[] = [];
  private nextEventId = 1;
  private startedAt: number;

  constructor(now: number = Date.now()) {
    this.startedAt = now;
  }

  private track(id: number, name: string): TrackedBee {
    let bee = this.bees.get(id);
    if (!bee) {
      bee = {
        id,
        name,
        online: false,
        seen: false,
        last: null,
        steps: [],
        recentLatePackets: [],
        network: null,
        traffic: [],
        latePackets: 0,
        dropouts: 0,
        restarts: 0,
        timesOffline: 0,
      };
      this.bees.set(id, bee);
    }
    bee.name = name;
    return bee;
  }

  private addEvent(
    bee: TrackedBee,
    kind: MonitorEventKind,
    text: string,
    now: number,
    amount: number = 1
  ) {
    // late packets and dropouts come in bursts: count them together
    if (kind === "late-packets" || kind === "dropouts") {
      const earlier = this.events.find(
        (event) =>
          event.beeId === bee.id &&
          event.kind === kind &&
          now - event.time < MERGE_EVENTS_MS
      );
      if (earlier) {
        earlier.amount += amount;
        earlier.until = now;
        return;
      }
    }
    // the newest event is the first one
    this.events.unshift({
      id: this.nextEventId,
      time: now,
      until: now,
      beeId: bee.id,
      beeName: bee.name,
      kind,
      text,
      amount,
    });
    this.nextEventId += 1;
    if (this.events.length > MAX_EVENTS) this.events.length = MAX_EVENTS;
  }

  /**
   * The step of the history that is going on now
   */
  private stepOf(bee: TrackedBee, now: number): Step {
    const index = Math.floor(now / MONITOR_STEP_MS);
    let step = bee.steps[bee.steps.length - 1];
    if (!step || step.index !== index) {
      step = { index, latePackets: 0, dropouts: 0, bytes: 0, seconds: 0 };
      const oldest = index - MONITOR_STEPS + 1;
      // eslint-disable-next-line no-param-reassign
      bee.steps = [...bee.steps.filter((s) => s.index >= oldest), step];
    }
    return step;
  }

  /**
   * Measure what went over the Wi-Fi of a bee since its last status
   */
  private measureTraffic(
    bee: TrackedBee,
    network: MonitorStatus["network"],
    now: number
  ) {
    const before = bee.network;
    // eslint-disable-next-line no-param-reassign
    bee.network = network ? { ...network, time: now } : null;
    if (!network || !before) return;
    const seconds = (now - before.time) / 1000;
    const receivedBytes = network.receivedBytes - before.receivedBytes;
    const sentBytes = network.sentBytes - before.sentBytes;
    const receivedPackets = network.receivedPackets - before.receivedPackets;
    // counters that went back belong to a bee that started again
    if (seconds <= 0 || seconds > 15 * 60) return;
    if (receivedBytes < 0 || sentBytes < 0 || receivedPackets < 0) return;
    bee.traffic.push({
      time: now,
      seconds,
      receivedBytes,
      sentBytes,
      receivedPackets,
    });
    // eslint-disable-next-line no-param-reassign
    bee.traffic = bee.traffic.filter(
      (traffic) => now - traffic.time < TRAFFIC_WINDOW_MS
    );
    const step = this.stepOf(bee, now);
    step.bytes += receivedBytes + sentBytes;
    step.seconds += seconds;
  }

  private count(
    bee: TrackedBee,
    latePackets: number,
    dropouts: number,
    now: number
  ) {
    if (latePackets === 0 && dropouts === 0) return;
    const step = this.stepOf(bee, now);
    step.latePackets += latePackets;
    step.dropouts += dropouts;
    // eslint-disable-next-line no-param-reassign
    bee.latePackets += latePackets;
    // eslint-disable-next-line no-param-reassign
    bee.dropouts += dropouts;
    if (latePackets > 0)
      bee.recentLatePackets.push({ time: now, amount: latePackets });
  }

  /**
   * A bee that exists, also when it was never heard
   */
  public know(beeId: number, beeName: string) {
    this.track(beeId, beeName);
  }

  /**
   * A bee sent its status
   */
  public reportStatus(
    beeId: number,
    beeName: string,
    status: MonitorStatus,
    now: number = Date.now()
  ) {
    const bee = this.track(beeId, beeName);
    // also after a silence: what a bee counted meanwhile is not lost
    const before = bee.last;

    if (!bee.online) {
      // a bee that is there when KweenB starts is no news
      if (bee.seen) this.addEvent(bee, "online", "Back online", now);
      bee.online = true;
      bee.seen = true;
    }

    const { stream, battery } = status;
    this.measureTraffic(bee, status.network || null, now);

    if (before) {
      // what was counted since the last status
      const sameRun =
        before.stream.state === "running" && stream.state === "running";
      // while a stream starts Jack and Jacktrip report late packets and
      // dropouts that are part of settling in, not of a bad connection
      const settling =
        stream.runningSeconds !== undefined &&
        stream.runningSeconds < SETTLE_SECONDS;
      if (sameRun && !settling) {
        const latePackets = counterIncrease(
          before.stream.glitches,
          stream.glitches
        );
        const dropouts = counterIncrease(before.stream.xruns, stream.xruns);
        this.count(bee, latePackets, dropouts, now);
        if (latePackets > 0)
          this.addEvent(bee, "late-packets", "Late packets", now, latePackets);
        if (dropouts > 0)
          this.addEvent(bee, "dropouts", "Sound card dropouts", now, dropouts);
      }
      const restarts = counterIncrease(before.stream.restarts, stream.restarts);
      if (restarts > 0 && stream.state !== "idle") {
        bee.restarts += restarts;
        this.addEvent(bee, "restart", "The sound chain restarted itself", now);
      }
    }

    // the sound chain started, stopped or ran into a problem
    const stateBefore = before ? before.stream.state : null;
    if (stateBefore !== null && stateBefore !== stream.state) {
      if (stream.state === "running")
        this.addEvent(
          bee,
          "stream-started",
          `Sound chain started${
            stream.mode ? ` (${streamModeNames[stream.mode]})` : ""
          }`,
          now
        );
      else if (stream.state === "idle")
        this.addEvent(bee, "stream-stopped", "Sound chain stopped", now);
      else if (stream.state === "error")
        this.addEvent(
          bee,
          "problem",
          stream.error || "The sound chain has a problem",
          now
        );
    }

    // the battery got into another zone
    const levelBefore = before ? before.battery.level : null;
    if (battery.level && battery.level !== levelBefore) {
      const percentage =
        battery.percentage === null ? "" : ` (${battery.percentage}%)`;
      if (battery.level === "low")
        this.addEvent(bee, "battery", `Battery low${percentage}`, now);
      else if (battery.level === "warning")
        this.addEvent(bee, "battery", `Battery running low${percentage}`, now);
    }

    // a copy: the caller keeps changing what it handed in
    bee.last = {
      stream: { ...stream },
      battery: { percentage: battery.percentage, level: battery.level },
      wifiSignalDbm: status.wifiSignalDbm,
      wifiFrequencyMhz: status.wifiFrequencyMhz ?? null,
      outputLevelDb: status.outputLevelDb ?? null,
    };
  }

  /**
   * A bee went silent (or was never heard)
   */
  public reportOffline(
    beeId: number,
    beeName: string,
    now: number = Date.now()
  ) {
    const bee = this.track(beeId, beeName);
    if (!bee.online) return;
    bee.online = false;
    // the counters are kept: a bee that was only out of reach goes on counting
    bee.traffic = [];
    bee.timesOffline += 1;
    const wasStreaming = bee.last?.stream.state === "running";
    this.addEvent(
      bee,
      "offline",
      wasStreaming ? "Went offline while playing" : "Went offline",
      now
    );
  }

  /**
   * A bee was removed from KweenB
   */
  public forget(beeId: number) {
    this.bees.delete(beeId);
  }

  /**
   * Start counting again
   */
  public clear(now: number = Date.now()) {
    this.events = [];
    this.startedAt = now;
    this.bees.forEach((bee) => {
      Object.assign(bee, {
        steps: [],
        recentLatePackets: [],
        latePackets: 0,
        dropouts: 0,
        restarts: 0,
        timesOffline: 0,
      });
    });
  }

  /**
   * How the swarm is doing right now
   */
  public snapshot(now: number = Date.now()): IMonitorSnapshot {
    const newest = Math.floor(now / MONITOR_STEP_MS);
    const bees: IMonitorBee[] = [...this.bees.values()]
      .sort((a, b) => a.id - b.id)
      .map((bee) => {
        // eslint-disable-next-line no-param-reassign
        bee.recentLatePackets = bee.recentLatePackets.filter(
          (recent) => now - recent.time < 60 * 1000
        );
        const history = new Array(MONITOR_STEPS).fill(0);
        const networkHistory = new Array(MONITOR_STEPS).fill(0);
        bee.steps.forEach((step) => {
          const position = MONITOR_STEPS - 1 - (newest - step.index);
          if (position < 0 || position >= MONITOR_STEPS) return;
          history[position] = step.latePackets;
          if (step.seconds > 0)
            networkHistory[position] = Math.round(
              (step.bytes * 8) / 1000 / step.seconds
            );
        });
        const traffic = bee.online
          ? bee.traffic.filter((t) => now - t.time < TRAFFIC_WINDOW_MS)
          : [];
        const seconds = traffic.reduce((sum, t) => sum + t.seconds, 0);
        const perSecond = (pick: (t: Traffic) => number) =>
          seconds > 0
            ? traffic.reduce((sum, t) => sum + pick(t), 0) / seconds
            : 0;
        const last = bee.online ? bee.last : null;
        return {
          id: bee.id,
          name: bee.name,
          online: bee.online,
          streamState: last ? last.stream.state : null,
          streamMode: last ? last.stream.mode : null,
          problem: last ? last.stream.error : null,
          latePacketsLastMinute: bee.recentLatePackets.reduce(
            (sum, recent) => sum + recent.amount,
            0
          ),
          latePackets: bee.latePackets,
          dropouts: bee.dropouts,
          restarts: bee.restarts,
          timesOffline: bee.timesOffline,
          history,
          measuresNetwork: bee.online && bee.network !== null,
          receivedKbps: Math.round(
            (perSecond((t) => t.receivedBytes) * 8) / 1000
          ),
          sentKbps: Math.round((perSecond((t) => t.sentBytes) * 8) / 1000),
          receivedPacketsPerSecond: Math.round(
            perSecond((t) => t.receivedPackets)
          ),
          linkMbps: bee.online && bee.network ? bee.network.linkMbps : null,
          networkHistory,
          wifiSignalDbm: last ? last.wifiSignalDbm : null,
          wifiFrequencyMhz: last ? last.wifiFrequencyMhz ?? null : null,
          outputLevelDb: last ? last.outputLevelDb ?? null : null,
          batteryPercentage: last ? last.battery.percentage : null,
          batteryLevel: last ? last.battery.level : null,
        };
      });
    return { since: this.startedAt, now, bees, events: this.events };
  }

  /**
   * What happened, as text (the oldest first), to keep or to send to someone
   */
  public logText(now: number = Date.now()): string {
    const two = (n: number) => String(n).padStart(2, "0");
    const moment = (time: number) => {
      const d = new Date(time);
      return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(
        d.getDate()
      )} ${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
    };
    const { bees } = this.snapshot(now);
    const lines = [
      `KweenB monitoring, ${moment(this.startedAt)} until ${moment(now)}`,
      "",
      "Per bee: late packets / sound card dropouts / restarts / times offline",
      ...bees.map(
        (bee) =>
          `  ${bee.name.padEnd(12)} ${bee.latePackets} / ${bee.dropouts} / ${
            bee.restarts
          } / ${bee.timesOffline}`
      ),
      "",
      "What happened",
      ...[...this.events]
        .reverse()
        .map(
          (event) =>
            `  ${moment(event.time)}  ${event.beeName.padEnd(12)} ${
              event.text
            }${event.amount > 1 ? `: ${event.amount}` : ""}`
        ),
    ];
    if (this.events.length === 0) lines.push("  Nothing.");
    return `${lines.join("\n")}\n`;
  }
}

export default SwarmMonitor;
