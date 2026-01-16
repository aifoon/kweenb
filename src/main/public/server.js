const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Sequelize, DataTypes, Op } = require("sequelize");

/**
 * Init Express
 */

// define paths
const isDevelopment = process.env.NODE_ENV !== "production";
const publicFolder = isDevelopment
  ? path.join(__dirname, "webserver")
  : path.join(__dirname, "webserver");

// define some variable
const port = 5050;

// create express app
const app = express();

// enable cors
app.use(cors());

// parse json bodies
app.use(express.json());

// set the public folder
app.use(express.static(publicFolder));

/**
 * Database setup for Sync API
 */
const dbPath = process.env.KWEENB_DB_PATH || "kweenb.sqlite";
let sequelize = null;
let Bee = null;
let AudioScene = null;
let InterfaceComposition = null;
let InterfaceCompositionBee = null;

const initDatabase = async () => {
  try {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
    });

    // Define Bee model
    Bee = sequelize.define(
      "Bee",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        ipAddress: { type: DataTypes.STRING, allowNull: false },
        isActive: { type: DataTypes.BOOLEAN, allowNull: false },
        channelType: { type: DataTypes.ENUM("mono", "stereo"), defaultValue: "mono" },
        channel1: { type: DataTypes.INTEGER, allowNull: false },
        channel2: { type: DataTypes.INTEGER, allowNull: true },
        pozyxTagId: { type: DataTypes.STRING, allowNull: true },
      },
      { tableName: "bees", timestamps: false }
    );

    // Define AudioScene model
    AudioScene = sequelize.define(
      "AudioScene",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        oscAddress: { type: DataTypes.STRING, allowNull: false },
        localFolderPath: { type: DataTypes.STRING, allowNull: false },
        beeId: { type: DataTypes.INTEGER, allowNull: false },
        manuallyAdded: { type: DataTypes.BOOLEAN, defaultValue: false },
        markedForDeletion: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      { tableName: "audio_scenes", timestamps: false }
    );

    // Define InterfaceComposition model
    InterfaceComposition = sequelize.define(
      "InterfaceComposition",
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
      },
      { tableName: "interface_compositions" }
    );

    // Define InterfaceCompositionBee model
    InterfaceCompositionBee = sequelize.define(
      "InterfaceCompositionBee",
      {
        interfaceCompositionId: { type: DataTypes.INTEGER, primaryKey: true },
        beeId: { type: DataTypes.INTEGER, primaryKey: true },
        audioSceneId: { type: DataTypes.INTEGER, allowNull: false },
        isLooping: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      { tableName: "interface_composition_bees", timestamps: false }
    );

    await sequelize.authenticate();
    console.log("Sync API: Database connected successfully");
  } catch (error) {
    console.error("Sync API: Database connection failed:", error.message);
  }
};

/**
 * Sync API Routes
 */
const syncRouter = express.Router();

// GET /api/sync/bees - Get all active bees with their audio scenes
syncRouter.get("/bees", async (req, res) => {
  try {
    if (!Bee || !AudioScene) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    // Get all active bees
    const bees = await Bee.findAll({ where: { isActive: true } });

    // Get all audio scenes for active bees (not marked for deletion)
    const beeIds = bees.map((b) => b.dataValues.id);
    const audioScenes = await AudioScene.findAll({
      where: {
        beeId: { [Op.in]: beeIds },
        markedForDeletion: false,
      },
    });

    // Group audio scenes by localFolderPath to create aggregated scenes
    const sceneMap = {};
    audioScenes.forEach((scene) => {
      const { id, name, beeId, oscAddress, localFolderPath } = scene.dataValues;
      if (!sceneMap[localFolderPath]) {
        sceneMap[localFolderPath] = {
          id,
          name,
          oscAddress,
          localFolderPath,
          foundOnBees: [],
        };
      }
      const bee = bees.find((b) => b.dataValues.id === beeId);
      if (bee) {
        sceneMap[localFolderPath].foundOnBees.push({
          id: bee.dataValues.id,
          name: bee.dataValues.name,
          ipAddress: bee.dataValues.ipAddress,
          isActive: bee.dataValues.isActive,
          channelType: bee.dataValues.channelType,
          channel1: bee.dataValues.channel1,
          channel2: bee.dataValues.channel2,
          pozyxTagId: bee.dataValues.pozyxTagId,
        });
      }
    });

    // Format bees for response
    const formattedBees = bees.map((b) => ({
      id: b.dataValues.id,
      name: b.dataValues.name,
      ipAddress: b.dataValues.ipAddress,
      isActive: b.dataValues.isActive,
      channelType: b.dataValues.channelType,
      channel1: b.dataValues.channel1,
      channel2: b.dataValues.channel2,
      pozyxTagId: b.dataValues.pozyxTagId,
    }));

    res.json({
      bees: formattedBees,
      audioScenes: Object.values(sceneMap),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync API error (bees):", error);
    res.status(500).json({ error: "Failed to fetch bees" });
  }
});

// GET /api/sync/compositions - Get all interface compositions
syncRouter.get("/compositions", async (req, res) => {
  try {
    if (!InterfaceComposition || !InterfaceCompositionBee || !Bee || !AudioScene) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    // Get all interface compositions
    const compositions = await InterfaceComposition.findAll();

    // Get all composition-bee relationships
    const compositionIds = compositions.map((c) => c.dataValues.id);
    const compositionBees = await InterfaceCompositionBee.findAll({
      where: { interfaceCompositionId: { [Op.in]: compositionIds } },
    });

    // Get all relevant bees and audio scenes
    const beeIds = [...new Set(compositionBees.map((cb) => cb.dataValues.beeId))];
    const audioSceneIds = [...new Set(compositionBees.map((cb) => cb.dataValues.audioSceneId))];

    const allBees = await Bee.findAll({ where: { id: { [Op.in]: beeIds } } });
    const allAudioScenes = await AudioScene.findAll({
      where: { id: { [Op.in]: audioSceneIds } },
    });

    // Create lookup maps
    const beesMap = {};
    allBees.forEach((b) => {
      beesMap[b.dataValues.id] = {
        id: b.dataValues.id,
        name: b.dataValues.name,
        ipAddress: b.dataValues.ipAddress,
        isActive: b.dataValues.isActive,
        channelType: b.dataValues.channelType,
        channel1: b.dataValues.channel1,
        channel2: b.dataValues.channel2,
        pozyxTagId: b.dataValues.pozyxTagId,
      };
    });

    const scenesMap = {};
    allAudioScenes.forEach((s) => {
      scenesMap[s.dataValues.id] = {
        id: s.dataValues.id,
        name: s.dataValues.name,
        oscAddress: s.dataValues.oscAddress,
        localFolderPath: s.dataValues.localFolderPath,
      };
    });

    // Build composition output
    const output = compositions.map((comp) => {
      const compositionRelations = compositionBees.filter(
        (cb) => cb.dataValues.interfaceCompositionId === comp.dataValues.id
      );

      const composition = compositionRelations.map((rel) => ({
        bee: beesMap[rel.dataValues.beeId] || null,
        audioScene: scenesMap[rel.dataValues.audioSceneId] || null,
        isLooping: rel.dataValues.isLooping,
      }));

      return {
        id: comp.dataValues.id,
        name: comp.dataValues.name,
        composition,
      };
    });

    res.json({
      compositions: output,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync API error (compositions):", error);
    res.status(500).json({ error: "Failed to fetch compositions" });
  }
});

// GET /api/sync/all - Get all data for full sync
syncRouter.get("/all", async (req, res) => {
  try {
    if (!Bee || !AudioScene || !InterfaceComposition || !InterfaceCompositionBee) {
      return res.status(503).json({ error: "Database not initialized" });
    }

    // Get bees and scenes (same as /bees endpoint)
    const bees = await Bee.findAll({ where: { isActive: true } });
    const beeIds = bees.map((b) => b.dataValues.id);
    const audioScenes = await AudioScene.findAll({
      where: {
        beeId: { [Op.in]: beeIds },
        markedForDeletion: false,
      },
    });

    // Group audio scenes
    const sceneMap = {};
    audioScenes.forEach((scene) => {
      const { id, name, beeId, oscAddress, localFolderPath } = scene.dataValues;
      if (!sceneMap[localFolderPath]) {
        sceneMap[localFolderPath] = { id, name, oscAddress, localFolderPath, foundOnBees: [] };
      }
      const bee = bees.find((b) => b.dataValues.id === beeId);
      if (bee) {
        sceneMap[localFolderPath].foundOnBees.push({
          id: bee.dataValues.id,
          name: bee.dataValues.name,
          ipAddress: bee.dataValues.ipAddress,
          isActive: bee.dataValues.isActive,
          channelType: bee.dataValues.channelType,
          channel1: bee.dataValues.channel1,
          channel2: bee.dataValues.channel2,
          pozyxTagId: bee.dataValues.pozyxTagId,
        });
      }
    });

    // Get compositions (same as /compositions endpoint)
    const compositions = await InterfaceComposition.findAll();
    const compositionIds = compositions.map((c) => c.dataValues.id);
    console.log(`[KWEENB SYNC DEBUG] Found ${compositions.length} compositions with IDs:`, compositionIds);

    const compositionBees = await InterfaceCompositionBee.findAll({
      where: { interfaceCompositionId: { [Op.in]: compositionIds } },
    });
    console.log(`[KWEENB SYNC DEBUG] Found ${compositionBees.length} composition-bee relations`);
    compositionBees.forEach((cb, idx) => {
      console.log(`[KWEENB SYNC DEBUG]   [${idx}] compositionId=${cb.dataValues.interfaceCompositionId}, beeId=${cb.dataValues.beeId}, audioSceneId=${cb.dataValues.audioSceneId}, isLooping=${cb.dataValues.isLooping}`);
    });

    const allBeeIds = [...new Set(compositionBees.map((cb) => cb.dataValues.beeId))];
    const audioSceneIds = [...new Set(compositionBees.map((cb) => cb.dataValues.audioSceneId))];
    console.log(`[KWEENB SYNC DEBUG] Unique beeIds to query:`, allBeeIds);
    console.log(`[KWEENB SYNC DEBUG] Unique audioSceneIds to query:`, audioSceneIds);

    const compositionBeesData = await Bee.findAll({ where: { id: { [Op.in]: allBeeIds } } });
    console.log(`[KWEENB SYNC DEBUG] Found ${compositionBeesData.length} bees for compositions`);

    // Check what audio scenes actually exist for these bees
    const allAudioScenesForBees = await AudioScene.findAll({
      where: { beeId: { [Op.in]: allBeeIds } },
    });
    console.log(`[KWEENB SYNC DEBUG] Total audio scenes in database for these bees: ${allAudioScenesForBees.length}`);
    if (allAudioScenesForBees.length > 0 && allAudioScenesForBees.length <= 20) {
      allAudioScenesForBees.forEach((s) => {
        console.log(`[KWEENB SYNC DEBUG]   Available scene: id=${s.dataValues.id}, name="${s.dataValues.name}", beeId=${s.dataValues.beeId}, markedForDeletion=${s.dataValues.markedForDeletion}`);
      });
    }

    const compositionScenesData = await AudioScene.findAll({
      where: { id: { [Op.in]: audioSceneIds } },
    });
    console.log(`[KWEENB SYNC DEBUG] Found ${compositionScenesData.length} audio scenes for compositions (querying by IDs: ${audioSceneIds.join(', ')})`);
    compositionScenesData.forEach((s) => {
      console.log(`[KWEENB SYNC DEBUG]   Scene: id=${s.dataValues.id}, name="${s.dataValues.name}", localFolderPath="${s.dataValues.localFolderPath}", beeId=${s.dataValues.beeId}`);
    });

    const beesMap = {};
    compositionBeesData.forEach((b) => {
      beesMap[b.dataValues.id] = {
        id: b.dataValues.id,
        name: b.dataValues.name,
        ipAddress: b.dataValues.ipAddress,
        isActive: b.dataValues.isActive,
        channelType: b.dataValues.channelType,
        channel1: b.dataValues.channel1,
        channel2: b.dataValues.channel2,
        pozyxTagId: b.dataValues.pozyxTagId,
      };
    });
    console.log(`[KWEENB SYNC DEBUG] Built beesMap with ${Object.keys(beesMap).length} entries:`, Object.keys(beesMap));

    const scenesDbMap = {};
    compositionScenesData.forEach((s) => {
      scenesDbMap[s.dataValues.id] = {
        id: s.dataValues.id,
        name: s.dataValues.name,
        oscAddress: s.dataValues.oscAddress,
        localFolderPath: s.dataValues.localFolderPath,
      };
    });
    console.log(`[KWEENB SYNC DEBUG] Built scenesDbMap with ${Object.keys(scenesDbMap).length} entries:`, Object.keys(scenesDbMap));

    const compositionsOutput = compositions.map((comp) => {
      const compositionRelations = compositionBees.filter(
        (cb) => cb.dataValues.interfaceCompositionId === comp.dataValues.id
      );
      console.log(`[KWEENB SYNC DEBUG] Composition "${comp.dataValues.name}" (id=${comp.dataValues.id}) has ${compositionRelations.length} bee relations`);

      const composition = compositionRelations.map((rel) => {
        const bee = beesMap[rel.dataValues.beeId] || null;
        const audioScene = scenesDbMap[rel.dataValues.audioSceneId] || null;
        console.log(`[KWEENB SYNC DEBUG]   Mapping relation: beeId=${rel.dataValues.beeId} => ${bee ? 'FOUND' : 'NULL'}, audioSceneId=${rel.dataValues.audioSceneId} => ${audioScene ? 'FOUND' : 'NULL'}`);
        if (!audioScene) {
          console.error(`[KWEENB SYNC DEBUG]   ✗ AudioScene ${rel.dataValues.audioSceneId} NOT FOUND in scenesDbMap! Available IDs:`, Object.keys(scenesDbMap));
        }
        return {
          bee,
          audioScene,
          isLooping: rel.dataValues.isLooping,
        };
      });
      return { id: comp.dataValues.id, name: comp.dataValues.name, composition };
    });

    // Format bees
    const formattedBees = bees.map((b) => ({
      id: b.dataValues.id,
      name: b.dataValues.name,
      ipAddress: b.dataValues.ipAddress,
      isActive: b.dataValues.isActive,
      channelType: b.dataValues.channelType,
      channel1: b.dataValues.channel1,
      channel2: b.dataValues.channel2,
      pozyxTagId: b.dataValues.pozyxTagId,
    }));

    res.json({
      bees: formattedBees,
      audioScenes: Object.values(sceneMap),
      compositions: compositionsOutput,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync API error (all):", error);
    res.status(500).json({ error: "Failed to fetch sync data" });
  }
});

// Mount sync router
app.use("/api/sync", syncRouter);

// create express router for frontend
const router = express.Router();
app.use("/", router);

/**
 * Endpoints
 */

router.get("*", (req, res) => {
  res.sendFile(path.join(publicFolder, "index.html"));
});

/**
 * Run server
 */

(async () => {
  // Initialize database for sync API
  await initDatabase();

  // Start the server
  app.listen(port, () => {
    console.log(`KweenB web server running on port ${port}`);
  });
})().catch(console.error);
