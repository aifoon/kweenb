/**
 * This class is used to handle the messages coming from the socket
 */

import { IBee, SocketMessage } from "@shared/interfaces";
import { SocketSingleton } from "./SocketSingleton";
import BeeHelpers from "../KweenB/BeeHelpers";
import { BeeActiveState } from "@shared/enums";
import { demoScenes } from "@seeds/demoScenes";
import {
  HAS_CONNECTION_WITH_PHYSICAL_SWARM,
  PD_PORT_BEE,
} from "@shared/consts";
import { PDBeeOsc } from "../OSC";

interface SocketHandlerParams {
  json: any;
  clientId: string;
}

export class SocketMessageHandler {
  /**
   * Handle incoming socket messages
   * @param message The message
   * @param payload The payload
   */
  public static async handleMessage({
    message,
    payload,
    clientId = "",
  }: SocketMessage) {
    // convert the message to a json object
    const json = JSON.parse(payload?.toString() || "{}");

    // create the method name
    const defaultMethod = `handleMessage`;

    // create the method to call
    const methodToCall: string = message
      .split("/")
      .reduce(
        (accumulator: string, currentString: string) =>
          accumulator +
          currentString.charAt(0).toUpperCase() +
          currentString.slice(1),
        ""
      );

    // call the method
    const methodName = `${defaultMethod}${methodToCall}`;
    if (
      Object.prototype.hasOwnProperty.call(SocketMessageHandler, methodName)
    ) {
      // @ts-ignore
      await SocketMessageHandler[
        methodName as keyof typeof SocketMessageHandler
      ]({ json, clientId });
    }
  }

  /**
   * Fetch the active bees
   */
  public static async handleMessageFetchActiveBees({
    clientId,
  }: SocketHandlerParams) {
    try {
      // get the active bees
      const activeBees = await BeeHelpers.getAllBees(BeeActiveState.ACTIVE);

      // send to client that made the request
      SocketSingleton.getInstance().sendToClient(
        clientId,
        "fetchActiveBees",
        activeBees
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Fetch all scenes
   * @param param0
   */
  public static async handleMessageFetchAllScenes({
    clientId,
  }: SocketHandlerParams) {
    try {
      // init the output
      let audioScenes = [];

      // get the audio scenes for the bee
      if (HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
        audioScenes = await BeeHelpers.getAudioScenes();
      } else {
        audioScenes = demoScenes;
      }

      // send to client that made the request
      SocketSingleton.getInstance().sendToClient(
        clientId,
        "fetchAllScenes",
        audioScenes
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Fetch Audioscenes for a bee
   * @param param0
   */
  public static async handleMessageFetchScenesForBee({
    clientId,
    json,
  }: SocketHandlerParams) {
    try {
      // get the requested bee
      const bee = json as IBee;

      // init the output
      let audioScenes = [];

      // get the audio scenes for the bee
      if (HAS_CONNECTION_WITH_PHYSICAL_SWARM) {
        audioScenes = await BeeHelpers.getAudioScenesForBee(bee);
      } else {
        audioScenes = demoScenes.filter((scene) =>
          scene.foundOnBees.some((currentBee) => currentBee.id === bee.id)
        );
      }

      // send to client that made the request
      SocketSingleton.getInstance().sendToClient(
        clientId,
        "fetchScenesForBee",
        audioScenes
      );
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Set volume of bees
   * @param param0
   */
  public static async handleMessageSetParamOfBees({
    json,
  }: SocketHandlerParams) {
    try {
      // get the volume and the bees
      const { value, bees, type } = json;

      // loop over bees and set the volume
      bees.forEach(async (bee: IBee) => {
        const pdBeeOsc = new PDBeeOsc(bee.ipAddress, PD_PORT_BEE);
        switch (type) {
          case "volume":
            pdBeeOsc.setVolume(value);
            break;
          case "low":
            pdBeeOsc.setBass(value);
            break;
          case "high":
            pdBeeOsc.setHigh(value);
            break;
          case "fileLoop":
            pdBeeOsc.setFileLoop(value as boolean);
            break;
          default:
            pdBeeOsc.setVolume(value);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Start audio on bees
   * @param param0
   */
  public static async handleMessageStartAudio({ json }: SocketHandlerParams) {
    try {
      // get the volume and the bees
      const { scene, bees } = json;

      // loop over bees and set the volume
      bees.forEach(async (bee: IBee) => {
        await BeeHelpers.startAudio(bee, scene.oscAddress);
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Stop audio on bees
   * @param param0
   */
  public static async handleMessageStopAudio({ json }: SocketHandlerParams) {
    try {
      // get the volume and the bees
      const { bees } = json;

      // loop over bees and set the volume
      bees.forEach(async (bee: IBee) => {
        await BeeHelpers.stopAudio(bee);
      });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Handle the message show connected clients
   */
  public static async handleMessageShowConnectedClients() {
    SocketSingleton.getInstance()
      .socketServer.of("/")
      .fetchSockets()
      .then((sockets) => {
        console.log("Amount of connected clients:", sockets.length);
        sockets.forEach((socket, index) => {
          console.log(`Client ${index + 1}:`, socket.id);
        });
      });
  }
}
