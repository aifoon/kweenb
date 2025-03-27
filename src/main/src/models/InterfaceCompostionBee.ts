import { Model, DataTypes, Sequelize } from "sequelize";

class InterfaceCompositionBee extends Model {
  static initialize(sequelize: Sequelize): void {
    InterfaceCompositionBee.init(
      {
        interfaceCompositionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "interface_compositions",
            key: "id",
          },
        },
        beeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "bees",
            key: "id",
          },
        },
        audioSceneId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        isLooping: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: "interface_composition_bees",
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: ["interfaceCompositionId", "beeId"],
          },
        ],
      }
    );
  }
}

export default InterfaceCompositionBee;
