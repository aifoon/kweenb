import { DataTypes, Model } from "sequelize";
import Database from "../database";

/**
 * Create the internal Setting Model
 */
class Setting extends Model {
  declare key: string;

  declare value: string;
}

/**
 * Init the Bee Model with sequelize
 */
Setting.init(
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: Database.getSequelize(),
    indexes: [
      {
        unique: true,
        fields: ["key"],
      },
    ],
    modelName: "Setting",
    tableName: "settings",
  }
);

/**
 * Sync the settings table
 */
Setting.sync({ alter: true });

export default Setting;
