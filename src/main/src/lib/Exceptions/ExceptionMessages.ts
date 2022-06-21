/**
 * A file with Exception Messages
 */

export const NO_BEE_FOUND_WITH_ID = (id: number) =>
  `No bee found with the id ${id}.`;

export const BEE_IS_UNDEFINED = () => `The bee is undefined.`;

export const BEE_NOT_ONLINE = (id: number) => `
  Bee with id ${id} is not online.
`;

export const FETCH_ERROR = (functionName: string, what: string = "") =>
  `Something went wrong while fetching (${functionName}).${
    what ? ` ${what}` : ""
  }`;

export const POST_ERROR = (functionName: string, what: string = "") =>
  `Something went wrong while posting (${functionName}).${
    what ? ` ${what}` : ""
  }`;

export const ZWERM3_API_NOTRUNNING = (ipAddress: string) =>
  `Zwerm3 API not running on ${ipAddress}.`;

export const HIVE_DOES_NOT_CONTAIN_RECEIVE_CHANNEL = (receiveChannel: string) =>
  `The hive does not contain the receive channel: ${receiveChannel}`;
