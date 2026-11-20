/**
 * A Database Instance
 */

import { randomUUID } from "crypto";
import { join } from "path";
import { Sequelize } from "sequelize";
import { SEQUELIZE_LOGGING, USER_DATA } from "./consts";

// Import models
import InterfaceComposition from "./models/InterfaceComposition";
import Bee from "./models/Bee";
import AudioScene from "./models/AudioScene";
import Setting from "./models/Setting";
import InterfaceCompositionBee from "./models/InterfaceCompostionBee";

class Database {
  public sequelize: Sequelize;
  private databasePath: string;
  private initialized: boolean = false;

  constructor(databasePath: string) {
    this.databasePath = databasePath;
    this.init();
  }

  init() {
    this.sequelize = new Sequelize({
      dialect: "sqlite",
      storage: this.databasePath,
      logging: SEQUELIZE_LOGGING,
    });
  }

  async initModels() {
    if (this.initialized) return;

    // Initialize all models
    InterfaceComposition.initialize(this.sequelize);
    Bee.initialize(this.sequelize);
    AudioScene.initialize(this.sequelize);
    Setting.initialize(this.sequelize);
    InterfaceCompositionBee.initialize(this.sequelize);

    // Set up associations between models
    // This would need all models to be initialized first
    const models = {
      InterfaceComposition,
      Bee,
      AudioScene,
      Setting,
      InterfaceCompositionBee,
    };

    Object.values(models).forEach((model: any) => {
      if (model.associate) {
        model.associate(models);
      }
    });

    this.initialized = true;
  }

  async sync() {
    await this.initModels();
    await this.sequelize.sync();
    await this.giveCompositionsTheirUid();
  }

  /**
   * A database of an earlier version has no uid for its compositions yet
   * (sync does not add a column to a table that exists)
   */
  private async giveCompositionsTheirUid() {
    const [columns] = await this.sequelize.query(
      "PRAGMA table_info(interface_compositions)"
    );
    if (!(columns as { name: string }[]).some(({ name }) => name === "uid"))
      await this.sequelize.query(
        "ALTER TABLE interface_compositions ADD COLUMN uid VARCHAR(255)"
      );
    const withoutUid = await InterfaceComposition.findAll({
      where: { uid: null },
    });
    for (const composition of withoutUid)
      await composition.update({ uid: randomUUID() }, { silent: true });
  }

  getSequelize(): Sequelize {
    if (this.sequelize) return this.sequelize;
    this.init();
    return this.getSequelize();
  }
}

export default new Database(
  process.env.NODE_ENV === "development"
    ? "kweenb.sqlite"
    : join(USER_DATA, "kweenb.sqlite")
);
