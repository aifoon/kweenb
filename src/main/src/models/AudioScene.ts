import { ChannelType } from "@shared/enums";
import { DataTypes, Model, Sequelize } from "sequelize";

/**
 * Create the internal AudioScene Model
 */
class AudioScene extends Model {
  declare id: number;
  declare name: string;
  declare oscAddress: string;
  declare localFolderPath: string;
  declare beeId: number;
  declare manuallyAdded: boolean;
  declare markedForDeletion: boolean;

  /**
   * Initialize the model with Sequelize instance
   */
  static initialize(sequelize: Sequelize): void {
    AudioScene.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
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
        },
        beeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        manuallyAdded: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        markedForDeletion: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: "AudioScene",
        tableName: "audio_scenes",
      }
    );
  }

  /**
   * Set up associations with other models
   */
  static associate(models: any): void {
    AudioScene.belongsTo(models.Bee, { foreignKey: "beeId" });
  }
}

export default AudioScene;
