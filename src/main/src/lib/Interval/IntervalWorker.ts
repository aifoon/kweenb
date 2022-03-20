/**
 * Defines a process
 */

export enum IntervalWorkerState {
  Initialized = 0,
  Pause = 1,
  Running = 2,
  Stopped = 3,
}

export interface IIntervalWorker {
  worker: () => void;
  pause: () => void;
  start: () => void;
  stop: () => void;
  state: IntervalWorkerState;
}

export default abstract class IntervalWorker implements IIntervalWorker {
  protected interval: number;

  public state: IntervalWorkerState;

  private currentInterval: NodeJS.Timer | null;

  constructor(interval: number = 1000) {
    this.interval = interval;
    this.state = IntervalWorkerState.Initialized;
    this.currentInterval = null;
  }

  abstract worker(): void;

  pause(): void {
    if (this.currentInterval && this.state === IntervalWorkerState.Running) {
      this.state = IntervalWorkerState.Pause;
    }
  }

  start(): void {
    this.currentInterval?.refresh();
    if (
      (!this.currentInterval &&
        this.state === IntervalWorkerState.Initialized) ||
      (this.currentInterval && this.state === IntervalWorkerState.Stopped)
    ) {
      this.currentInterval = setInterval(this.worker.bind(this), this.interval);
      this.state = IntervalWorkerState.Running;
    }
    if (this.currentInterval && this.state === IntervalWorkerState.Pause) {
      this.state = IntervalWorkerState.Running;
    }
  }

  stop(): void {
    if (
      this.currentInterval &&
      (this.state === IntervalWorkerState.Running ||
        this.state === IntervalWorkerState.Pause)
    ) {
      clearInterval(this.currentInterval);
      this.state = IntervalWorkerState.Stopped;
    }
  }
}
