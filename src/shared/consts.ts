import { AppMode, AppViews } from "./enums";

// do we have physical swarm? Otherwise use demo data in some cases.
export const HAS_CONNECTION_WITH_PHYSICAL_SWARM = false;

// the pure data port
export const PD_PORT_BEE = 9001;

// default app mode
export const DEFAULT_APP_MODE = AppMode.Hub;

// default app views
export const DEFAULT_APP_VIEWS = [
  AppViews.Swarm,
  AppViews.Audio,
  AppViews.Settings,
];
