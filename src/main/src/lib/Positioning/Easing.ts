import { linear } from "tween-functions";

export class Easing {
  private _currentInterval: NodeJS.Timer;

  private _intervalTime: number = 20;

  constructor(intervalTime = 20) {
    this._intervalTime = intervalTime;
  }

  animate(
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => void
  ) {
    if (this._currentInterval) clearInterval(this._currentInterval);
    const startTime = Date.now();
    this._currentInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime: number = currentTime - startTime;
      const currentValue = linear(elapsedTime, startValue, endValue, duration);
      if (onUpdate) onUpdate(currentValue);
      if (elapsedTime >= duration) {
        clearInterval(this._currentInterval);
      }
    }, this._intervalTime);
  }
}
