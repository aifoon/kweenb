import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Tooltip } from "@mui/material";
import { isSound, levelFill } from "@components/Cards/BeeIndicators";
import { useLiveLevel } from "@renderer/src/hooks/useLiveLevels";

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

interface LiveLevelBarProps {
  beeId: number;
  height?: number;
  // called with the level whenever it changes (null: the bee does not tell)
  onLevel?: (levelDb: number | null) => void;
}

export const LiveLevelBar = ({
  beeId,
  height = 6,
  onLevel,
}: LiveLevelBarProps) => {
  const level = useLiveLevel(beeId);
  // the loudest moment stays for a while and then falls back
  const [peak, setPeak] = useState(-100);
  const tell = useRef(onLevel);
  tell.current = onLevel;

  // the marker of the loudest moment falls back by itself, also when the
  // level stays the same (silence)
  const current = useRef<number | null>(level);
  current.current = level;
  useEffect(() => {
    const fall = setInterval(() => {
      setPeak((before) => {
        const now = current.current === null ? -100 : current.current;
        return Math.max(now, before > -100 ? before - 0.7 : -100);
      });
    }, 93);
    return () => clearInterval(fall);
  }, []);

  useEffect(() => {
    if (tell.current) tell.current(level);
  }, [level]);

  // a bee that does not tell its level shows an empty meter
  const shown = level === null ? -100 : level;
  let explanation = "This bee does not tell its level";
  if (level !== null)
    explanation = isSound(level)
      ? `Sound is coming out (${Math.round(level)} dB)`
      : "Silent";

  return (
    <Tooltip title={explanation}>
      <Track height={height} style={{ opacity: level === null ? 0.4 : 1 }}>
        <Fill
          style={{ width: `${positionOf(shown)}%`, background: colorOf(shown) }}
        />
        {isSound(peak) && (
          <Peak style={{ left: `calc(${positionOf(peak)}% - 2px)` }} />
        )}
      </Track>
    </Tooltip>
  );
};
