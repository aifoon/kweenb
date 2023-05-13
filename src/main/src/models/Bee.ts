import { ChannelType } from "@shared/interfaces";
import { DataTypes, Model } from "sequelize";
import Database from "../database";

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
}

/**
 * Init the Bee Model with sequelize
 */
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
    }
  },
  {
    sequelize: Database.getSequelize(),
    modelName: "Bee",
    tableName: "bees",
  }
);

/**
 * Sync the bee table
 */
Bee.sync({ alter: true });

export default Bee;
