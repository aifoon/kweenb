import { PositioningTargetType } from "@shared/interfaces";
import { OscBase } from "./OSC/OscBase";

export interface PositioningTarget {
  targetType: PositioningTargetType;
  target: OscBase;
  enabled: boolean;
}
