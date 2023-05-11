import { IError } from "@shared/interfaces";
import { KweenBGlobal } from "../../kweenb";
import { MQTT } from "../Mqtt";

export class PozyxMqttBroker {
   private static _pozyxMqttBroker: MQTT;

  /**
   * Gets true of the broker is connected
   */
   static get connected() {
    return this._pozyxMqttBroker?._mqttClient?.connected;
   }

  /**
   * Get a single instance of the Pozyx MQTT broker
   * @param pozyxMqttBrokerUrl The url that reference the Pozyx MQTT broker
   * @returns
   */
   private static getPozyxMqttBrokerInstance(pozyxMqttBrokerUrl?: string, force?: boolean) {
    if((!this._pozyxMqttBroker && pozyxMqttBrokerUrl) || (pozyxMqttBrokerUrl && force)) {
      this._pozyxMqttBroker = new MQTT(pozyxMqttBrokerUrl, {
        onConnect: () => KweenBGlobal.kweenb.showSuccess('Connected to MQTT broker'),
        onError: (error: IError) => KweenBGlobal.kweenb.throwError(error),
        onMessage: (topic, message) => console.log(message.toString())
      });
    }
    return this._pozyxMqttBroker;
   }

  /**
   * Connect to the Pozyx MQTT broker
   * @param pozyxMqttBrokerUrl The url that reference the Pozyx MQTT broker
   */
   public static async connectToPozyxMqttBroker(pozyxMqttBrokerUrl: string): Promise<boolean> {
    try {
      const pozyxMqttBrokerInstance =
        this.getPozyxMqttBrokerInstance(pozyxMqttBrokerUrl, this._pozyxMqttBroker?.brokerUrl !== pozyxMqttBrokerUrl);
      await pozyxMqttBrokerInstance.connectToMqttClient();
      pozyxMqttBrokerInstance.subscribe('tags');
      return true;
    } catch(e) {
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
}