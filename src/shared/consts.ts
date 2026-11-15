import { AppMode, AppViews } from "./enums";

// the pure data port
export const PD_PORT_BEE = 9001;

// default app mode
export const DEFAULT_APP_MODE = AppMode.Hub;

// default app views
export const DEFAULT_APP_VIEWS = [
  AppViews.Swarm,
  AppViews.Audio,
  AppViews.Routing,
  AppViews.Monitor,
  AppViews.Settings,
];
