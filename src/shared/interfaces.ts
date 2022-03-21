/**
 * Shared interfaces
 */

export interface IError {
  message: string;
}

/**
 * For Bee
 */

export interface IBee {
  id: number;
  name: string;
  ipAddress: string;
  isOnline: boolean;
  config: IBeeConfig | null;
  status: IBeeStatus | null;
}

export interface IBeeConfig {
  jacktripVersion: string;
  useMqtt: boolean;
}

export interface IBeeStatus {
  isJackRunning: boolean;
  isJacktripRunning: boolean;
}
