import { ChannelType } from "@shared/enums";
import { DataTypes, Model, Sequelize } from "sequelize";
import AudioScene from "./AudioScene";

/**
 * Create the internal Bee Model
 */
class Bee extends Model {
  declare id: number;
  declare name: string;
  declare ipAddress: string;
  declare isActive: boolean;
  declare channelType: ChannelType;
  declare channel1: number;
  declare channel2: number;
  declare pozyxTagId: string;

  /**
   * Initialize the model with Sequelize instance
   */
  static initialize(sequelize: Sequelize): void {
    Bee.init(
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
        ipAddress: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        channelType: {
          type: DataTypes.ENUM("mono", "stereo"),
          allowNull: false,
          defaultValue: "mono",
        },
        channel1: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        channel2: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        pozyxTagId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Bee",
        tableName: "bees",
      }
    );
  }

  /**
   * Set up associations with other models
   */
  static associate(models: any): void {
    Bee.belongsToMany(models.InterfaceComposition, {
      through: "InterfaceCompositionBee",
      foreignKey: "beeId",
    });
    Bee.hasMany(models.AudioScene, {
      foreignKey: "beeId",
    });
  }
}

export default Bee;
