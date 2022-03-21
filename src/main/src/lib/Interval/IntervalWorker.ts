/* eslint-disable class-methods-use-this */
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
  isAsync: boolean;
  pause: () => void;
  start: () => void;
  startAsync: () => Promise<any>;
  stop: () => void;
  state: IntervalWorkerState;
}

export default abstract class IntervalWorker implements IIntervalWorker {
  protected interval: number;

  public state: IntervalWorkerState;

  private currentInterval: NodeJS.Timer | null;

  public isAsync: boolean;

  constructor(interval: number = 1000, isAsync: boolean = false) {
    this.interval = interval;
    this.state = IntervalWorkerState.Initialized;
    this.currentInterval = null;
    this.isAsync = isAsync;
  }

  /**
   * Logic
   */

  protected worker(): void {
    throw new Error("The worker is not implemented");
  }

  protected async asyncWorker(): Promise<any> {
    throw new Error("The async worker is not implemented");
  }

  pause(): void {
    if (this.currentInterval && this.state === IntervalWorkerState.Running) {
      this.state = IntervalWorkerState.Pause;
    }
  }

  async startAsync() {
    if (
      (!this.currentInterval &&
        this.state === IntervalWorkerState.Initialized) ||
      (this.currentInterval && this.state === IntervalWorkerState.Stopped)
    ) {
      this.currentInterval = setInterval(
        await this.asyncWorker.bind(this),
        this.interval
      );
      this.state = IntervalWorkerState.Running;
    }
    if (this.currentInterval && this.state === IntervalWorkerState.Pause) {
      this.state = IntervalWorkerState.Running;
    }
  }

  start(): void {
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
