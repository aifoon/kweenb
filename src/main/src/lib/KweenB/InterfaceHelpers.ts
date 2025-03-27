import { InterfaceComposition } from "@shared/interfaces";
import Database from "../../database";

// Import models
import BeeDB from "../../models/Bee";
import InterfaceCompositionDB from "../../models/InterfaceComposition";
import InterfaceCompositionBeeDB from "../../models/InterfaceCompostionBee";
import BeeHelpers from "./BeeHelpers";

/**
 * Add a Bee to an InterfaceComposition
 * @param interfaceCompositionId The ID of the InterfaceComposition
 * @param beeId The ID of the Bee to add
 * @param audioSceneId The ID of the AudioScene to associate
 * @param isLooping Optional boolean indicating if the Bee should loop (defaults to false)
 * @returns Promise<boolean> True if successful, False if failed
 */
const addInterfaceCompositionBee = async (
  interfaceCompositionId: string | number,
  beeId: string | number,
  audioSceneId: string | number,
  isLooping: boolean = false
): Promise<boolean> => {
  if (!interfaceCompositionId || !beeId || !audioSceneId) {
    return false;
  }

  // Using a transaction to ensure data consistency
  const transaction = await Database.sequelize.transaction();

  try {
    // Check if the relationship already exists
    const existingRelation = await InterfaceCompositionBeeDB.findOne({
      where: {
        interfaceCompositionId: interfaceCompositionId,
        beeId: beeId,
        audioSceneId: audioSceneId,
      },
      transaction,
    });

    if (existingRelation) {
      // If the relation exists but isLooping changed, update it
      if (existingRelation.dataValues.isLooping !== isLooping) {
        await existingRelation.update({ isLooping }, { transaction });
      }

      await transaction.commit();
      return true;
    }

    // Create the new association
    await InterfaceCompositionBeeDB.create(
      {
        interfaceCompositionId: interfaceCompositionId,
        beeId: beeId,
        audioSceneId: audioSceneId,
        isLooping: isLooping,
      },
      {
        transaction,
      }
    );

    // Commit the transaction
    await transaction.commit();
    return true;
  } catch (error) {
    // If anything goes wrong, roll back the transaction
    await transaction.rollback();
    console.error("Error adding bee to interface composition:", error);
    throw error;
  }
};

/**
 * Remove a specific Bee from an InterfaceComposition
 * @param compositionId The ID of the InterfaceComposition
 * @param beeId The ID of the Bee to remove
 * @returns Promise<boolean> True if successful, False if no records were deleted
 */
const deleteInterfaceCompositionBee = async (
  compositionId: string | number,
  beeId: string | number
): Promise<boolean> => {
  if (!compositionId || !beeId) {
    return false;
  }

  // Using a transaction to ensure data consistency
  const transaction = await Database.sequelize.transaction();

  try {
    // Delete the specific association in the join table
    const deletedCount = await InterfaceCompositionBeeDB.destroy({
      where: {
        interfaceCompositionId: compositionId,
        beeId: beeId,
      },
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    // Return true if at least one record was deleted
    return deletedCount > 0;
  } catch (error) {
    // If anything goes wrong, roll back the transaction
    await transaction.rollback();
    console.error("Error removing bee from interface composition:", error);
    throw error;
  }
};

/**
 * Delete multiple InterfaceCompositions by ID
 * @param ids Array of InterfaceComposition IDs to delete
 * @returns Number of compositions successfully deleted
 */
const deleteMultipleInterfaceCompositions = async (
  ids: Array<string | number>
): Promise<number> => {
  if (!ids || ids.length === 0) {
    return 0;
  }

  // Using a transaction is recommended when deleting multiple related records
  const transaction = await Database.sequelize.transaction();

  try {
    // 1. Delete all associations in the join table for these compositions
    await InterfaceCompositionBeeDB.destroy({
      where: {
        interfaceCompositionId: ids,
      },
      transaction,
    });

    // 2. Delete the InterfaceCompositions themselves
    const deletedCount = await InterfaceCompositionDB.destroy({
      where: {
        id: ids,
      },
      transaction,
    });

    // Commit the transaction
    await transaction.commit();

    return deletedCount;
  } catch (error) {
    // If anything goes wrong, roll back the transaction
    await transaction.rollback();
    console.error("Error deleting multiple interface compositions:", error);
    throw error;
  }
};

/**
 * Get all interface compositions
 * @returns
 */
const getInterfaceCompositions = async () => {
  // Step 1: Get all interface compositions
  const interfaceCompositions = await InterfaceCompositionDB.findAll();

  // Step 2: Get all interface composition bees in one query
  const allCompositionIds = interfaceCompositions.map(
    (comp) => comp.dataValues.id
  );
  const allInterfaceCompositionBees = await InterfaceCompositionBeeDB.findAll({
    where: {
      interfaceCompositionId: allCompositionIds,
    },
  });

  // Get all bee and audio scene IDs
  const beeIds = Array.from(
    new Set(allInterfaceCompositionBees.map((icb) => icb.dataValues.beeId))
  );
  const audioSceneIds = Array.from(
    new Set(
      allInterfaceCompositionBees.map((icb) => icb.dataValues.audioSceneId)
    )
  );

  // Fetch all relevant bees and audio scenes in bulk
  const allBees = await BeeDB.findAll({
    where: { id: beeIds },
  });

  // Fetch all relevant audio scenes in bulk
  const allAudioScenes = await BeeHelpers.getAudioScenes(audioSceneIds);

  // Create maps for efficient lookups
  const beesMap: { [key: string | number]: any } = {};
  allBees.forEach((bee) => {
    beesMap[bee.dataValues.id] = bee.dataValues;
  });

  const audioScenesMap: { [key: string | number]: any } = {};
  allAudioScenes.forEach((scene) => {
    audioScenesMap[scene.id] = scene;
  });

  // Step 3: Create a map for quick lookup
  const compositionBeesMap: {
    [key: string | number]: Array<{
      bee: any;
      audioScene: any;
      isLooping: boolean;
    }>;
  } = {};
  allInterfaceCompositionBees.forEach((icBee) => {
    const compositionId = icBee.dataValues.interfaceCompositionId;
    const beeId = icBee.dataValues.beeId;
    const audioSceneId = icBee.dataValues.audioSceneId;
    const isLooping = icBee.dataValues.isLooping;

    if (!compositionBeesMap[compositionId]) {
      compositionBeesMap[compositionId] = [];
    }

    compositionBeesMap[compositionId].push({
      bee: beesMap[beeId],
      audioScene: audioScenesMap[audioSceneId],
      isLooping,
    });
  });

  // Step 4: Build the final output
  const output = interfaceCompositions.map((interfaceComposition) => {
    const compositionId = interfaceComposition.dataValues.id;
    return {
      id: compositionId,
      name: interfaceComposition.dataValues.name,
      composition: compositionBeesMap[compositionId] || [],
    };
  });
  return output;
};

/**
 * Update an existing InterfaceComposition in the database
 * @param composition The updated InterfaceComposition data
 * @returns Promise<void>
 */
const updateInterfaceComposition = async (
  composition: InterfaceComposition
): Promise<void> => {
  // Using a transaction to ensure data consistency
  const transaction = await Database.sequelize.transaction();

  try {
    // 1. Check if the InterfaceComposition exists
    const existingComposition = await InterfaceCompositionDB.findByPk(
      composition.id
    );
    if (!existingComposition) {
      await transaction.rollback();
      return;
    }

    // 2. Update the InterfaceComposition name if it changed
    if (composition.name !== existingComposition.dataValues.name) {
      await existingComposition.update(
        { name: composition.name },
        { transaction }
      );
    }

    // 3. Get current associations
    const currentAssociations = await InterfaceCompositionBeeDB.findAll({
      where: { interfaceCompositionId: composition.id },
      transaction,
    });

    // 4. Filter valid new composition data
    const validNewData = composition.composition.filter(
      (relation) => relation.bee.id && relation.audioScene?.id
    );

    // 5. Create maps for efficient comparison - we'll use composite keys
    const currentAssociationsMap = new Map();
    currentAssociations.forEach((assoc) => {
      const key = `${assoc.dataValues.beeId}_${assoc.dataValues.audioSceneId}`;
      currentAssociationsMap.set(key, assoc.dataValues);
    });

    const newRelationsMap = new Map();
    validNewData.forEach((relation) => {
      const key = `${relation.bee.id}_${relation.audioScene?.id}`;
      newRelationsMap.set(key, relation);
    });

    // 6. Process updates and additions
    const updatePromises = [];
    const toCreate = [];

    // Handle new and updated associations
    for (const [key, relation] of newRelationsMap.entries()) {
      const beeId = relation.bee.id;
      const audioSceneId = relation.audioScene.id;

      if (currentAssociationsMap.has(key)) {
        // Check if isLooping changed
        const existingAssoc = currentAssociationsMap.get(key);
        if (existingAssoc.isLooping !== relation.isLooping) {
          updatePromises.push(
            InterfaceCompositionBeeDB.update(
              { isLooping: relation.isLooping },
              {
                where: {
                  interfaceCompositionId: composition.id,
                  beeId,
                  audioSceneId,
                },
                transaction,
              }
            )
          );
        }
      } else {
        // New association to create
        toCreate.push({
          interfaceCompositionId: composition.id,
          beeId,
          audioSceneId,
          isLooping: relation.isLooping,
        });
      }
    }

    // 7. Handle deletions - find records to delete
    const deletePromises = [];

    for (const [key, existingAssoc] of currentAssociationsMap.entries()) {
      if (!newRelationsMap.has(key)) {
        // This association should be deleted
        deletePromises.push(
          InterfaceCompositionBeeDB.destroy({
            where: {
              interfaceCompositionId: composition.id,
              beeId: existingAssoc.beeId,
              audioSceneId: existingAssoc.audioSceneId,
            },
            transaction,
          })
        );
      }
    }

    // 8. Execute all database operations
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    if (toCreate.length > 0) {
      await InterfaceCompositionBeeDB.bulkCreate(toCreate, { transaction });
    }

    // 9. Commit the transaction
    await transaction.commit();
  } catch (error) {
    // If anything goes wrong, roll back the transaction
    await transaction.rollback();
    console.error("Error updating interface composition:", error);
    throw error;
  }
};

/**
 * Update the looping state of a Bee in an InterfaceComposition
 * @param interfaceCompositionId The ID of the InterfaceComposition
 * @param beeId The ID of the Bee
 * @param isLooping Boolean indicating the new looping state
 * @param audioSceneId Optional AudioScene ID to specify a particular relationship
 * @returns Promise<boolean> True if successful, False if no records were updated
 */
const updateInterfaceCompositionBeeLooping = async (
  interfaceCompositionId: string | number,
  beeId: string | number,
  isLooping: boolean,
  audioSceneId?: string | number
): Promise<boolean> => {
  if (!interfaceCompositionId || !beeId) {
    return false;
  }

  // Using a transaction to ensure data consistency
  const transaction = await Database.sequelize.transaction();

  try {
    // Build the where clause
    const whereClause: any = {
      interfaceCompositionId: interfaceCompositionId,
      beeId: beeId,
    };

    // If audioSceneId is provided, add it to the where clause
    if (audioSceneId) {
      whereClause.audioSceneId = audioSceneId;
    }

    // Update the isLooping state
    const [updatedCount] = await InterfaceCompositionBeeDB.update(
      { isLooping },
      {
        where: whereClause,
        transaction,
      }
    );

    // Commit the transaction
    await transaction.commit();

    // Return true if at least one record was updated
    return updatedCount > 0;
  } catch (error) {
    // If anything goes wrong, roll back the transaction
    await transaction.rollback();
    console.error("Error updating bee looping state:", error);
    throw error;
  }
};

/**
 * Save an InterfaceComposition in the database
 * @param composition
 */
const saveInterfaceCompositionAs = async (
  composition: Omit<InterfaceComposition, "id">
): Promise<InterfaceComposition> => {
  // Using a transaction is recommended for creating related records
  const transaction = await Database.sequelize.transaction();

  // 1. Create the InterfaceComposition
  const interfaceComposition = await InterfaceCompositionDB.create(
    { name: composition.name },
    { transaction }
  );

  // 2. Create the associations with Bees including the audioSceneId
  if (composition.composition.length > 0) {
    // filter out bees and audioscene that don't have an id
    const validData = composition.composition.filter(
      (relation) => relation.bee.id && relation.audioScene?.id
    );

    // Prepare the data for bulk creation
    const compositionBees = validData.map((relation) => ({
      interfaceCompositionId: interfaceComposition.dataValues.id,
      beeId: relation.bee.id,
      audioSceneId: relation.audioScene?.id,
      isLooping: relation.isLooping,
    }));

    // Create the join table entries
    await InterfaceCompositionBeeDB.bulkCreate(compositionBees, {
      transaction,
    });
  }

  // Commit the transaction
  await transaction.commit();

  // Return the created interface composition
  return {
    ...interfaceComposition.dataValues,
    composition: composition.composition,
  };
};

export default {
  addInterfaceCompositionBee,
  deleteInterfaceCompositionBee,
  deleteMultipleInterfaceCompositions,
  getInterfaceCompositions,
  saveInterfaceCompositionAs,
  updateInterfaceComposition,
  updateInterfaceCompositionBeeLooping,
};
