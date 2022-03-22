/**
 * A module with helpers used for getting bees and their config
 */

import { IBeeConfig, IBeeStatus } from "@shared/interfaces";
import Bee from "../../models/Bee";

export const getBeeConfig = async (id: number): Promise<IBeeConfig> => {
  // get the bee behind the id
  await Bee.findOne({ where: { id } });

  // @TODO get the configuration from a bee
  const beeConfig = {
    jacktripVersion: "1.4.1",
    useMqtt: false,
  };

  // return the configuration
  return beeConfig;
};

export const getBeeStatus = async (id: number): Promise<IBeeStatus> => {
  // get the bee behind the id
  const bee = await Bee.findOne({ where: { id } });

  // @TODO get the configuration from a bee
  const beeStatus = {
    isJackRunning: true,
    isJacktripRunning: true,
  };

  // return the configuration
  return beeStatus;
};
