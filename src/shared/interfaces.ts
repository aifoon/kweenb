/**
 * Shared interfaces
 */

export interface IError {
  message: string;
}

export interface IBeeConfig {
  jacktripVersion: string;
  useMqtt: boolean;
}

export interface IBee {
  id: number;
  name: string;
  ipAddress: string;
  isOnline: boolean;
  config: IBeeConfig;
}
