import { linear } from "tween-functions";

export class Easing {
  private _currentInterval: NodeJS.Timer;

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
    }, 20);
  }
}
