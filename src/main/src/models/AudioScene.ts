import { ChannelType } from "@shared/enums";
import { DataTypes, Model } from "sequelize";
import Database from "../database";

/**
 * Create the internal AudioScene Model
 */
class AudioScene extends Model {
  declare name: string;

  declare oscAddress: string;

  declare localFolderPath: string;

  declare beeId: number;
}

/**
 * Init the Bee Model with sequelize
 */
AudioScene.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oscAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    localFolderPath: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    beeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize: Database.getSequelize(),
    modelName: "AudioScene",
    tableName: "audio_scenes",
  }
);

/**
 * Sync the audio_scenes table
 */

AudioScene.sync();

export default AudioScene;
