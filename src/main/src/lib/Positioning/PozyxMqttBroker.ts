import { IError, IPozyxData } from "@shared/interfaces";
import { KweenBGlobal } from "../../kweenb";
import { MQTT } from "../Mqtt";
import { PozyxData } from "./PozyxData";
import PositioningControllerSingleton from "./PositioningControllerSingleton";

export class PozyxMqttBroker {
  private static _pozyxMqttBroker: MQTT;

  /**
   * Gets true of the broker is connected
   */
  static get connected() {
    return this._pozyxMqttBroker?._mqttClient?.connected;
  }

  /**
   * Connect to the Pozyx MQTT broker
   * @param pozyxMqttBrokerUrl The url that reference the Pozyx MQTT broker
   */
  public static async connectToPozyxMqttBroker(
    pozyxMqttBrokerUrl: string
  ): Promise<boolean> {
    try {
      const pozyxMqttBrokerInstance = this.getPozyxMqttBrokerInstance(
        pozyxMqttBrokerUrl,
        this._pozyxMqttBroker?.brokerUrl !== pozyxMqttBrokerUrl
      );
      await pozyxMqttBrokerInstance.connectToMqttClient();
      pozyxMqttBrokerInstance.subscribe("tags");
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Disconnect the Pozyx MQTT broker
   * @param pozyxMqttBrokerUrl The url that reference the Pozyx MQTT broker
   */
  public static async disconnectPozyxMqttBroker(pozyxMqttBrokerUrl: string) {
    await this._pozyxMqttBroker.disconnectMqttClient();
  }

  /**
   * Get a single instance of the Pozyx MQTT broker
   * @param pozyxMqttBrokerUrl The url that reference the Pozyx MQTT broker
   * @returns
   */
  private static getPozyxMqttBrokerInstance(
    pozyxMqttBrokerUrl?: string,
    force?: boolean
  ) {
    if (
      (!this._pozyxMqttBroker && pozyxMqttBrokerUrl) ||
      (pozyxMqttBrokerUrl && force)
    ) {
      this._pozyxMqttBroker = new MQTT(pozyxMqttBrokerUrl, {
        onConnect: () =>
          KweenBGlobal.kweenb.showSuccess("Connected to MQTT broker"),
        onError: (error: IError) => KweenBGlobal.kweenb.throwError(error),
        onMessage: (topic, message) =>
          message && topic && this.messageHandler(topic, message),
      });
    }
    return this._pozyxMqttBroker;
  }

  /**
   * This function will handle the incoming messages
   * @param topic The topic of the message
   * @param message The message that is received
   */
  private static messageHandler(topic: string, message: any) {
    switch (topic) {
      case "tags": {
        // convert the data to IPozyxData
        const pozyxData = JSON.parse(message.toString()).pop() as IPozyxData;

        // set the pozyx data in memory
        PozyxData.setPozyxData(pozyxData);

        // let the renderer know that we have new data
        KweenBGlobal.kweenb.mainWindow.webContents.send(
          "pozyx-data",
          PozyxData.getAllPozyxData()
        );

        // let the positioning controller know that we have new data
        PositioningControllerSingleton.getInstance().positioningUpdateReceived(
          PozyxData.getAllPozyxData()
        );

        // break the switch
        break;
      }
      default: {
        console.log(`Unknown topic: "${topic}"`);
      }
    }
  }
}
