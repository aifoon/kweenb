/**
 * LogarithmicVolume calculates a logarithmic volume curve.
 */

interface LogarithmicVolume {
  volDB: number;
  volPct: number;
  vol: number;
}

export class LogarithmicVolumeCalculator {
  private logA: number;

  private logB: number;

  private logRolloff: number;

  constructor(logDBRange: number) {
    this.logA = 1 / 10 ** (logDBRange / 20);
    this.logB = Math.log(1 / this.logA);
    this.logRolloff = 10 * this.logA * Math.exp(this.logB * 0.1);
  }

  /**
   * A helper function to scale a number from one range to another.
   * @param number The number to scale
   * @param fromMin From minimum
   * @param fromMax From maximum
   * @param toMin To minimum
   * @param toMax To maximum
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  private scaleNumberInRange(
    number: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
  ) {
    return ((number - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
  }

  /**
   * A helper function to convert a linear volume to a logarithmic volume.
   * @param linearVolume The linear volume to convert to a logarithmic volume
   * @param maxVolume The maximum volume to return
   * @returns
   */
  public calculate(
    linearVolume: number,
    decimals: number = 2,
    maxVolume: number = 1
  ): LogarithmicVolume {
    let vol = Math.max(0, Math.log(linearVolume / this.logA) / this.logB);
    if (vol < 0.1) {
      vol /= this.logRolloff;
    }
    vol = Math.max(Math.min(vol, 1.0), 0.0);
    vol = this.scaleNumberInRange(vol, 0, 1, 0, maxVolume);
    vol = Math.round(vol * 10 ** decimals) / 10 ** decimals;
    return {
      vol,
      volDB: 20 * Math.log10(linearVolume),
      volPct: vol * 100,
    };
  }
}
