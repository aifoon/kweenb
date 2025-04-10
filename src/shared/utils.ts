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
   * Calculate the latency of the audio system
   * @param sampleRate The sample rate of the audio system
   * @param bufferSize The buffer size of the audio system
   * @param periods The number of periods
   * @returns
   */
  calculateLatency: (
    sampleRate: number,
    bufferSize: number,
    periods: number
  ) => {
    return Utils.roundToDecimals((bufferSize / sampleRate) * periods * 1000, 2);
  },

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
   * A function that converts a string to a legal name for a directory
   * @param name The string to convert
   * @returns The converted legal name for a directory
   */
  convertToLegalDirectoryName: (name: string): string => {
    // Remove any special characters and replace them with underscores
    const legalName = name.replace(/[^\w\s]/gi, "_");

    // Remove leading and trailing spaces
    const trimmedName = legalName.trim();

    // Replace consecutive spaces with a single space
    const normalizedName = trimmedName.replace(/\s+/g, " ");

    // Convert spaces to underscores
    const directoryName = normalizedName.replace(/\s/g, "_");

    // Convert to lowercase
    const lowercaseName = directoryName.toLowerCase();

    return lowercaseName;
  },

  /**
   * Returns a Promise that resolves after a specified delay
   * @param ms The delay time in milliseconds
   * @returns A Promise that resolves after the specified delay
   */
  delay: (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * This function will generate a unique id
   * @param prefix
   * @returns
   */
  generateUniqueIdForReactComponents: (prefix = "id") => {
    const timestamp = Date.now().toString(36); // compact time
    const random = Math.random().toString(36).slice(2, 10); // 8 random characters
    return `${prefix}-${timestamp}-${random}`;
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

  /**
   * A function that checks if a number has decimals
   * @param number The number to check
   * @returns True if the number has decimals, false otherwise
   */
  hasDecimals: (number: number): boolean => {
    return number % 1 !== 0;
  },

  /**
   * A function that will round a number to a specified number of decimal places
   * @param number The number to round
   * @param decimals The number of decimal places to round to
   * @returns The rounded number
   */
  roundToDecimals: (number: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(number * factor) / factor;
  },
};
