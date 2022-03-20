/**
 * A Dumb Hello World action
 */

import { IpcMainEvent } from "electron";

export const hello = (event: IpcMainEvent, name: string) => {
  console.log(`Hello ${name}! Send on process ${event.processId}.`);
};
