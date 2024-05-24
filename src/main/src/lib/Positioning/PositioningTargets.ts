import { PositioningTargetType } from "@shared/interfaces";
import { OSCMONITOR_PORT, REAPER_OSC_PORT } from "../../consts";
import { OscMonitor, ReaperOsc } from "../OSC";
import { PositioningTarget } from "./PositioningTarget";

/**
 * Define the positioning targets here
 */

const positioningTargets: PositioningTarget[] = [];

positioningTargets.push({
  targetType: PositioningTargetType.Reaper,
  target: new ReaperOsc("127.0.0.1", REAPER_OSC_PORT),
  enabled: false,
});

positioningTargets.push({
  targetType: PositioningTargetType.OscMonitor,
  target: new OscMonitor("127.0.0.1", OSCMONITOR_PORT),
  enabled: false,
});

export default positioningTargets;
