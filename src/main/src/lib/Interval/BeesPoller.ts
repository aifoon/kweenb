/**
 * BeesPoller is an intervalworker that will poll for the bee status
 */

import ping from "ping";
import { IBee } from "@shared/interfaces";
import { BEE_POLLING_SECONDS } from "../../consts";
import { KweenBGlobal } from "../../kweenb";
import Bee from "../../models/Bee";
import IntervalWorker, { IntervalWorkerState } from "./IntervalWorker";

export default class BeesPoller extends IntervalWorker {
  constructor() {
    super(BEE_POLLING_SECONDS * 1000);
  }

  worker() {
    // no work when pausing
    if (this.state === IntervalWorkerState.Pause) return;

    // find bees and do work
    Bee.findAll().then((bees) => {
      // get all the ip addresses of our bees and map the ping promises
      // NOTE: ping timeout is the interval timeout - 1.
      // So the ping timeout will always trigger first, this
      // means that our ping will always be finished before the next
      // interval starts.
      const beeIpAddresses = bees.map(({ ipAddress }) =>
        ping.promise.probe(ipAddress, { timeout: this.interval / 1000 - 1 })
      );

      // check connectivity, by ping to device
      // wait untill all addresses are pinged
      Promise.all(beeIpAddresses).then((connectivityList) => {
        const beesConnectivity: IBee[] = bees.map(({ id, name, ipAddress }) => {
          // find the host in our bee list
          const beeHost = connectivityList.find(
            ({ inputHost }) => inputHost === ipAddress
          );

          // return the bee, according to the IBee interface
          return {
            id,
            name,
            ipAddress,
            isOnline: beeHost ? beeHost.alive : false,
          };
        });

        // send out to renderer
        KweenBGlobal.kweenb.mainWindow.webContents.send(
          "update-bees",
          beesConnectivity
        );
      });
    });
  }
}
