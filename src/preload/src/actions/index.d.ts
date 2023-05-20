declare const _default: {
    positioning: {
        enablePositioningControllerAlgorithm: (algorithm: PositioningControllerAlgorithm, enabled: boolean) => void;
        enablePositioningControllerTargetType: (targetType: PositioningTargetType, enabled: boolean) => void;
        updatePositioningControllerAlgorithmOptions: <TAlgorithmOptions>(algorithm: PositioningControllerAlgorithm, options: TAlgorithmOptions) => void;
    };
    beePoller: (action: "pause" | "stop" | "start", params?: any[]) => void;
    beesPoller: (action: "pause" | "stop" | "start") => void;
    disconnectPozyxMqttBroker: () => void;
    sayHello: (name: string) => void;
    setBeeActive: (id: number, active: boolean) => void;
    setBeePozyxTagId: (bee: IBee, pozyxTagId: string) => void;
    setJackFolderPath: (jackFolderPath: string) => void;
    setJacktripBinPath: (jacktripBinPath: string) => void;
};
export default _default;
