/**
 * An object that contains a lot of handy utils
 */

export const Utils = {
  /**
   * A function that will add a leading zero to a number
   * and return a string
   */
  addLeadingZero: (number: number | string | undefined): string => {
    let incoming = number;
    if (incoming === undefined || !incoming) incoming = 0;
    if (typeof number === "string") {
      incoming = Number(number);
    }
    return Number(incoming) < 10 ? `0${incoming}` : `${incoming}`;
  },

  /**
   * A function that will capitalize the first letter of string
   * @param s
   * @returns
   */
  capitalize: (s: string) => (s && s[0].toUpperCase() + s.slice(1)) || "",

  /**
   * A function that will compare two arrays
   */
  compareArrays: (a: any, b: any) => {
    return (
      a.length === b.length &&
      a.every((element: any, index: any) => element === b[index])
    );
  },

  /**
   * Get the time difference between two dates in seconds
   * @param date1 The first date
   * @param date2 The second date
   * @returns The time difference in seconds
   */
  getTimeDifferenceInSeconds: (date1: Date, date2: Date): number => {
    const differenceInMilliseconds = Math.abs(
      date2.getTime() - date1.getTime()
    );
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
    return differenceInSeconds;
  },
};
