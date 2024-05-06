import { IError, IPositioningSettings, IPozyxData } from "@shared/interfaces";
import { POSITIONING_INTERVAL_MS } from "../../consts";
import { KweenBGlobal } from "../../kweenb";
import { MQTT } from "../Mqtt";
import { PozyxData } from "./PozyxData";
import PositioningControllerSingleton from "./PositioningControllerSingleton";
import SettingHelpers from "../KweenB/SettingHelpers";

export class PozyxMqttBroker {
  private static _pozyxMqttBroker: MQTT;

  private static _positioningControllerInterval: NodeJS.Timeout;

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
  public static async disconnectPozyxMqttBroker() {
    const pozyxMqttBrokerInstance = this.getPozyxMqttBrokerInstance();
    if (!pozyxMqttBrokerInstance) return;
    await this.getPozyxMqttBrokerInstance().disconnectMqttClient();
    if (this._positioningControllerInterval)
      clearInterval(this._positioningControllerInterval);
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
        onConnect: () => {
          // show a success message
          KweenBGlobal.kweenb.showSuccess("Connected to MQTT broker");

          // get the positioning settings from the database
          SettingHelpers.getAllSettings().then((settings) => {
            this.startPositioningControllerInterval(
              settings.positioningSettings
            );
          });
        },
        onError: (error: IError) => KweenBGlobal.kweenb.throwError(error),
        onMessage: (topic, message) =>
          message && topic && this.messageHandler(topic, message),
      });
    }
    return this._pozyxMqttBroker;
  }

  /**
   * Start the positioning controller interval
   */
  private static startPositioningControllerInterval(
    positioningSettings: IPositioningSettings
  ) {
    // if we have an interval already, clear it
    if (this._positioningControllerInterval)
      clearInterval(this._positioningControllerInterval);

    // set the positioning settings for the controller to use
    this._positioningControllerInterval = setInterval(() => {
      PositioningControllerSingleton.getInstance().positioningSettings =
        positioningSettings;

      // update the positioning for our controllers
      PositioningControllerSingleton.getInstance().positioningUpdate(
        PozyxData.getAllPozyxData()
      );

      // let the renderer know that we have new data
      KweenBGlobal.kweenb.mainWindow.webContents.send(
        "pozyx-data",
        PozyxData.getAllPozyxData()
      );
    }, positioningSettings.updateRate || POSITIONING_INTERVAL_MS);
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
        if (pozyxData.success) {
          PozyxData.setPozyxData(pozyxData);
        }

        // break the switch
        break;
      }
      default: {
        console.log(`Unknown topic: "${topic}"`);
      }
    }
  }
}
