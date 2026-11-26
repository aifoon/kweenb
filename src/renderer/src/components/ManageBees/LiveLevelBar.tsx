import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Tooltip } from "@mui/material";
import { isSound, levelFill } from "@components/Cards/BeeIndicators";
import { onLiveLevel, readLiveLevel } from "@renderer/src/hooks/useLiveLevels";

/**
 * The live meter of a bee: how loud the sound is that leaves it, right now
 */

const Track = styled.div<{ height: number }>`
  position: relative;
  height: ${({ height }) => height}px;
  border-radius: ${({ height }) => height / 2}px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const Fill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
`;

const Peak = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--white);
  opacity: 0.8;
`;

// from silence to the loudest
const positionOf = levelFill;

// the bee tells the average level, not the peaks: a tone at full scale
// reads -3 dB, music that clips reads lower still
const colorOf = (levelDb: number): string => {
  if (levelDb >= -3) return "var(--red-status)";
  return levelDb >= -12 ? "var(--orange-status)" : "var(--green-status)";
};

/**
 * All meters on the screen move on one clock: the marker of the loudest
 * moment falls back, and a bee that stopped telling loses its meter.
 */
const TICK_MS = 93;
const ticks = new Set<() => void>();
let clock: number | null = null;

const onTick = (tick: () => void) => {
  ticks.add(tick);
  if (clock === null)
    clock = window.setInterval(() => ticks.forEach((t) => t()), TICK_MS);
  return () => {
    ticks.delete(tick);
    if (ticks.size === 0 && clock !== null) {
      window.clearInterval(clock);
      clock = null;
    }
  };
};

// the words under the mouse and the level for the page follow this often
const TELL_MS = 250;

const explain = (level: number | null): string => {
  if (level === null) return "This bee does not tell its level";
  return isSound(level)
    ? `Sound is coming out (${Math.round(level)} dB)`
    : "Silent";
};

interface LiveLevelBarProps {
  beeId: number;
  height?: number;
  // called with the level when it changed, a few times a second at most
  // (null: the bee does not tell)
  onLevel?: (levelDb: number | null) => void;
}

export const LiveLevelBar = ({
  beeId,
  height = 6,
  onLevel,
}: LiveLevelBarProps) => {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const [explanation, setExplanation] = useState(explain(null));
  const tell = useRef(onLevel);
  tell.current = onLevel;

  // The meter is written straight to the screen: with thirty bees that are
  // hundreds of small changes a second, too many to draw the page again for.
  useEffect(() => {
    // the loudest moment stays for a while and then falls back
    let peak = -100;
    let toldLevel: number | null | undefined;
    let toldAt = 0;

    const show = (level: number | null) => {
      const shown = level === null ? -100 : level;
      if (track.current)
        track.current.style.opacity = level === null ? "0.4" : "1";
      if (fill.current) {
        fill.current.style.width = `${positionOf(shown)}%`;
        fill.current.style.background = colorOf(shown);
      }
      if (marker.current) {
        marker.current.style.display = isSound(peak) ? "block" : "none";
        marker.current.style.left = `calc(${positionOf(peak)}% - 2px)`;
      }
    };

    const follow = () => {
      const level = readLiveLevel(beeId);
      if (level !== null && level > peak) peak = level;
      show(level);
    };

    const tick = () => {
      const level = readLiveLevel(beeId);
      const now = level === null ? -100 : level;
      peak = Math.max(now, peak > -100 ? peak - 0.7 : -100);
      show(level);
      // the words follow more slowly than the meter
      const time = Date.now();
      if (level !== toldLevel && time - toldAt >= TELL_MS) {
        toldLevel = level;
        toldAt = time;
        setExplanation(explain(level));
        if (tell.current) tell.current(level);
      }
    };

    tick();
    const stopFollowing = onLiveLevel(beeId, follow);
    const stopTicking = onTick(tick);
    return () => {
      stopFollowing();
      stopTicking();
    };
  }, [beeId]);

  return (
    <Tooltip title={explanation}>
      <Track ref={track} height={height} style={{ opacity: 0.4 }}>
        <Fill ref={fill} style={{ width: "0%" }} />
        <Peak ref={marker} style={{ display: "none" }} />
      </Track>
    </Tooltip>
  );
};
