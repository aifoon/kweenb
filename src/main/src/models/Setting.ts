import { DataTypes, Model, Sequelize } from "sequelize";

/**
 * Create the internal Setting Model
 */
class Setting extends Model {
  declare id: number;
  declare key: string;
  declare value: string;

  /**
   * Initialize the model with Sequelize instance
   */
  static initialize(sequelize: Sequelize): void {
    Setting.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        key: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        value: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "Setting",
        tableName: "settings",
      }
    );
  }

  /**
   * Set up associations with other models
   */
  static associate(models: any): void {
    // Settings typically don't have associations
    // But you can add them here if needed
  }
}

export default Setting;
