/**
 * A list to manage one or more processes
 */

import { IIntervalWorker, IntervalWorkerState } from "./IntervalWorker";

export default class IntervalWorkerList {
  private processes: Record<string, IIntervalWorker>;

  constructor() {
    this.processes = {};
  }

  addProcess(name: string, process: IIntervalWorker) {
    if (!this.hasProcess(name)) {
      this.processes[name] = process;
    } else {
      throw new Error("Process name already exists.");
    }
  }

  private hasProcess(name: string): boolean {
    return name in this.processes;
  }

  pauseProcess(name: string) {
    if (!this.hasProcess(name)) return;
    this.processes[name].pause();
  }

  removeProcess(name: string) {
    if (!this.hasProcess(name)) return;
    if (this.processes[name].state === IntervalWorkerState.Stopped) {
      delete this.processes[name];
    } else {
      this.stopProcess(name);
      this.removeProcess(name);
    }
  }

  startProcess(name: string) {
    if (!this.hasProcess(name)) return;
    const process = this.processes[name];
    if (process.isAsync) this.processes[name].startAsync();
    else this.processes[name].start();
  }

  stopProcess(name: string) {
    if (!this.hasProcess(name)) return;
    this.processes[name].stop();
  }
}
