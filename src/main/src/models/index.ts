import Bee from "./Bee";
import AudioScene from "./AudioScene";
import Setting from "./Setting";

AudioScene.belongsTo(Bee, { foreignKey: "beeId", as: "bee" });
Bee.hasMany(AudioScene, { foreignKey: "beeId", as: "audioScenes" });

export { Bee, AudioScene, Setting };
