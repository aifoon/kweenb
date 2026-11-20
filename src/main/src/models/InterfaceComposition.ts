import { Model, DataTypes, Sequelize } from "sequelize";
import { Association } from "sequelize";
import Bee from "./Bee";

// InterfaceComposition model class
class InterfaceComposition extends Model {
  // Declare associations
  declare Bees: Bee[]; // Add this line

  // Add association types
  declare static associations: {
    Bees: Association<InterfaceComposition, Bee>;
  };

  static initialize(sequelize: Sequelize): void {
    InterfaceComposition.init(
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
        // the same composition has the same uid in KweenB and on the
        // satellite (their own numbers differ)
        uid: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: DataTypes.UUIDV4,
        },
      },
      {
        sequelize,
        tableName: "interface_compositions",
        timestamps: true,
      }
    );
  }

  static associate(models: any): void {
    InterfaceComposition.belongsToMany(models.Bee, {
      through: "InterfaceCompositionBee",
      foreignKey: "interfaceCompositionId",
      as: "Bees",
    });
  }
}

export default InterfaceComposition;
