/**
 * A file with Exception Messages
 */

export const NO_BEE_FOUND_WITH_ID = (id: number) =>
  `No bee found with the id ${id}.`;

export const FETCH_ERROR = (functionName: string, what: string = "") =>
  `Something went wrong while fetching (${functionName}).${
    what ? ` ${what}` : ""
  }`;

export const POST_ERROR = (functionName: string, what: string = "") =>
  `Something went wrong while posting (${functionName}).${
    what ? ` ${what}` : ""
  }`;
