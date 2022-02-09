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
    return incoming < 10 ? `0${incoming}` : `${incoming}`;
  },

  /**
   * A function that will capitalize the first letter of string
   * @param s
   * @returns
   */
  capitalize: (s: string) => (s && s[0].toUpperCase() + s.slice(1)) || "",
};
