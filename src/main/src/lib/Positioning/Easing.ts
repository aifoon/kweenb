import { linear } from "tween-functions";

export class Easing {
  private _currentInterval: NodeJS.Timer;

  private _intervalTime: number = 20;

  private _lastValue: number;

  constructor(intervalTime = 20) {
    this._intervalTime = intervalTime;
  }

  animate(
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => Promise<void>
  ) {
    if (this._currentInterval) clearInterval(this._currentInterval);
    const startTime = Date.now();
    this._currentInterval = setInterval(async () => {
      // get timings
      const currentTime = Date.now();
      const elapsedTime: number = currentTime - startTime;

      // calculate the value
      let currentValue = linear(elapsedTime, startValue, endValue, duration);

      // validate
      if (currentValue <= 0) currentValue = 0;

      // decimals to 2 after comma
      currentValue = Math.round((currentValue + Number.EPSILON) * 100) / 100;

      // if nothing has changed, there is no update needed
      if (this._lastValue === currentValue) {
        this._lastValue = currentValue;
        return;
      }

      // set the last value
      this._lastValue = currentValue;

      // let the outsiders know
      if (onUpdate) await onUpdate(currentValue);

      // timing validation
      if (elapsedTime >= duration) {
        clearInterval(this._currentInterval);
      }
    }, this._intervalTime);
  }
}
