/**
 * List of interfaces
 */

export interface SocketData {
  socketUrl: string;
}

export interface ControlButtonActions {
  onLeftButtonPressed: () => void;
  onMiddleButtonPressed: () => void;
  onRightButtonPressed: () => void;
}
