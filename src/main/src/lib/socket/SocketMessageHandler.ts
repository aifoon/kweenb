/**
 * This class is used to handle the messages coming from the socket
 */

import { AudioScene, IBee, SocketMessage } from "@shared/interfaces";
import { SocketSingleton } from "./SocketSingleton";
import BeeHelpers from "../KweenB/BeeHelpers";
import { BeeActiveState } from "@shared/enums";
import { PD_PORT_BEE } from "@shared/consts";
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
      // get the audio scenes for the bee
      const audioScenes = await BeeHelpers.getAudioScenes();

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

      // get the audio scenes for the bee
      const audioScenes = await BeeHelpers.getAudioScenesForBee(bee);

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
      // get the params and the bees
      const { value, bees, type } = json;

      // loop over bees and set the volume
      BeeHelpers.setAudioParam(bees, type, value);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Start audio on bees
   * Note: we have an AudioScene to play on one or more bees
   * @param param0
   */
  public static async handleMessageStartAudio({ json }: SocketHandlerParams) {
    try {
      // get the scenes and the bees
      const { scene, bees } = json;

      // loop over bees and start audio
      await BeeHelpers.startAudio(bees, scene.oscAddress);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Start audio on multiple bees
   * Note: we have a list of multiple AudioScenes to play on one bee
   * @param param0
   */
  public static async handleMessageStartAudioMultiple({
    json,
  }: SocketHandlerParams) {
    try {
      // get the scenes and the bees
      const { data }: { data: { scene: AudioScene; bee: IBee }[] } = json;

      // loop over the data
      for (const { scene, bee } of data) {
        await BeeHelpers.startAudio(bee, scene.oscAddress);
      }
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

      // loop over bees and stop the audio
      await BeeHelpers.stopAudio(bees);
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
