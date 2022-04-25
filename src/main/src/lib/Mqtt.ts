/**
 * Creates an MQTT class
 */
import * as mqtt from "mqtt";
import * as ping from "ping";

export class MQTT {
  private _brokerUrl: string;

  private _host: string;

  private _port: string;

  public _mqttClient: mqtt.MqttClient;

  private _onMessage: (topic: string, payload: any) => void;

  constructor(
    brokerUrl: string,
    onMessage: (topic: string, payload: any) => void
  ) {
    this._brokerUrl = brokerUrl;
    this._onMessage = onMessage;
    this.init();
  }

  private init() {
    let url = this._brokerUrl;
    if (url.startsWith("mqtt://")) {
      url = url.slice("mqtt://".length);
    }
    const [host, port] = url.split(":");
    this._host = host;
    this._port = port;
  }

  /**
   * Connect to an MQTT client
   * @returns
   */
  private async connectToMqttClient() {
    // get the online state of the mqtt broker
    const mqttConnectivity = await ping.promise.probe(this._host, {
      timeout: 1,
      deadline: 1,
    });

    // check if mqtt is reachable
    if (!mqttConnectivity) return null;

    // create the MQTT client promise and wait until connected
    const connectSync = new Promise<mqtt.MqttClient>((resolve) => {
      const mc = mqtt.connect(this._brokerUrl);
      mc.on("connect", () => {
        mc.on("message", this._onMessage);
        resolve(mc);
      });
    });

    // return the promise
    return connectSync;
  }

  /**
   * Get the MQTT singleton
   * @returns
   */
  public async getMQTTClient(): Promise<mqtt.MqttClient> {
    if (this._mqttClient) return this._mqttClient;

    const mqttClient = await this.connectToMqttClient();
    if (!mqttClient) throw new Error("Cannot connect to MQTT broker.");
    this._mqttClient = mqttClient;
    return this.getMQTTClient();
  }

  /**
   * Subscribe to a topic
   * @param topic The topic to subscribe
   * @param callback Callback whenever we receive a message
   * @returns
   */
  public async subscribe(topic: string) {
    // get an mqtt instance
    const mqttClient = await this.getMQTTClient();

    // validate
    if (!mqttClient) return;

    // subscribe to topic
    mqttClient.subscribe(topic);
  }

  /**
   * Unsubscribe topic
   * @param topic
   * @returns
   */
  public async unsubscribe(topic: string) {
    // get an mqtt instance
    const mqttClient = await this.getMQTTClient();

    // validate
    if (!mqttClient) return;

    // unsubscribe topic
    await mqttClient.unsubscribe(topic);
  }
}
