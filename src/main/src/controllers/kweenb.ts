/**
 * All the KweenB controller endpoints
 */

import { KweenBException } from "../lib/Exceptions/KweenBException";
import kweenBHelpers from "../lib/KweenB/KweenBHelpers";

/**
 * Kill all jack and jacktrip processes
 * @param event
 * @param bee
 */
export const killJackAndJacktrip = async () => {
  try {
    await kweenBHelpers.killJackAndJacktrip();
  } catch (e: any) {
    throw new KweenBException(
      { where: "killJackAndJacktrip()", message: e.message },
      true
    );
  }
};

/**
 * Start the client and connect to the kween
 * @param event
 * @param bee
 */
export const startJackWithJacktripClient = async () => {
  try {
    await kweenBHelpers.startJackWithJacktripClient();
  } catch (e: any) {
    throw new KweenBException(
      { where: "startJackWithJacktripClient()", message: e.message },
      true
    );
  }
};
