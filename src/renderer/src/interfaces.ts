/**
 * A File With Interfaces
 */

export interface BeeConfig {
  ipAddress: string;
  name: string;
  jacktripVersion: string;
  useMqtt: boolean;
}

export interface BeeConfigItem {
  key: string;
  value: string;
}
