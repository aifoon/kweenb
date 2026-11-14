/**
 * A file with Exception Messages
 */

export const NO_BEE_FOUND_WITH_ID = (id: number) =>
  `No bee found with the id ${id}.`;

export const BEE_NOT_ONLINE = (id: number) => `
  Bee with id ${id} is not online.
`;

export const HIVE_DOES_NOT_CONTAIN_RECEIVE_CHANNEL = (receiveChannel: string) =>
  `The hive does not contain the receive channel: ${receiveChannel}`;
