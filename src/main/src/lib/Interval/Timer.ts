/**
 * A Demonstrative Timer
 */

import IntervalWorker, { IntervalWorkerState } from "./IntervalWorker";

export default class Timer extends IntervalWorker {
  private currentTimer: number;

  constructor() {
    super(1000);
    this.currentTimer = 0;
  }

  worker(): void {
    if (this.state === IntervalWorkerState.Pause) return;
    this.currentTimer += 1;
    console.log(this.currentTimer);
  }
}
