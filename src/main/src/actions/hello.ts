/**
 * A Dumb Hello World action
 */

import { IpcMainEvent } from "electron";

export default (event: IpcMainEvent, args: any) => {
  console.log(`Hello World: ${args} send on ${event.processId}`);
};
