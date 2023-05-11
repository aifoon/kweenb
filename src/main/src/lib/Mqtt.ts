/**
 * Creates an MQTT class
 */
import { IError } from "@shared/interfaces";
import * as mqtt from "mqtt";
import * as ping from "ping";

export class MQTT {
  private _brokerUrl: string;

  private _host: string;

  private _port: string;

  public _mqttClient: mqtt.MqttClient;

  private _onMessage: ((topic: string, payload: any) => void) | undefined;

  private _onError: ((error: IError) => void) | undefined;

  private _onConnect: () => void | undefined;

  constructor(
    brokerUrl: string,
    options: {
      onMessage?: (topic: string, payload: any) => void,
      onError?: (error: IError) => void,
      onConnect: () => void
    }
  ) {
    this._brokerUrl = brokerUrl;
    this._onMessage = options.onMessage;
    this._onError = options.onError;
    this._onConnect = options.onConnect;
    this.init();
  }

  /**
   * Gets the current broken url
   */
  public get brokerUrl() {
    return this._brokerUrl;
  }

  /**
   * Connect to an MQTT client
   * @returns
   */
  public async connectToMqttClient() {
    // get the online state of the mqtt broker
    const mqttConnectivity = await ping.promise.probe(this._host, {
      timeout: 1,
      deadline: 1,
    });

    // check if mqtt is reachable
    if (!mqttConnectivity) return null;

    // create the MQTT client promise and wait until connected
    const connectSync = new Promise<mqtt.MqttClient>((resolve, reject) => {
      // try connecting to MQTT
      this._mqttClient = mqtt.connect(
        this._brokerUrl, {
          reconnectPeriod: 1000,
          connectTimeout: 1000
        }
      );

      // whenever we encounter an error, close the connection
      this._mqttClient.on('error', (error) => {
        const errorMessage = error.message.includes("ECONNREFUSED") ?
            "Cannot connect to MQTT broker." :
            error.message
        if(this._onError) this._onError({
          message: errorMessage,
          where: "connectToMqttClient"
        });
        this._mqttClient.end();
        reject(errorMessage)
      })

      // whenever we are connected,
      this._mqttClient.on("connect", () => {
        // let them now
        if(this._onConnect) this._onConnect();

        // whenever we receive a message
        this._mqttClient.on("message", (topic, message) => {
          if(this._onMessage) this._onMessage(topic, message);
        });

        // resolve the promise
        resolve(this._mqttClient);
      });
    });

    // return the promise
    return connectSync;
  }

  /**
   * Disconnect from current MQTT client
   */
  public disconnectMqttClient() {
    if(this._mqttClient && this._mqttClient.connected) {
      this._mqttClient.end(true);
    }
  }

  /**
   * Initialize the MQTT connection
   */
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
   * Subscribe to a topic
   * @param topic The topic to subscribe
   * @param callback Callback whenever we receive a message
   * @returns
   */
  public async subscribe(topic: string) {
    // validate
    if (!this._mqttClient || !this._mqttClient.connected) return;

    console.log('subscribe');

    // subscribe to topic
    this._mqttClient.subscribe(topic);
  }

  /**
   * Unsubscribe topic
   * @param topic
   * @returns
   */
  public async unsubscribe(topic: string) {
    // validate
    if (!this._mqttClient || !this._mqttClient.connected) return;

    // unsubscribe topic
    await this._mqttClient.unsubscribe(topic);
  }
}
