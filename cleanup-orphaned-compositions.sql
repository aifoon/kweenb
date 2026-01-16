-- Cleanup script for orphaned interface_composition_bees records
-- Run this on the main KweenB database (kweenb.sqlite)

-- First, let's see what orphaned records exist
SELECT
    icb.interfaceCompositionId,
    icb.beeId,
    icb.audioSceneId,
    icb.isLooping,
    ic.name as composition_name
FROM interface_composition_bees icb
LEFT JOIN audio_scenes as ON icb.audioSceneId = as.id
LEFT JOIN interface_compositions ic ON icb.interfaceCompositionId = ic.id
WHERE as.id IS NULL;

-- Delete orphaned records
-- Uncomment the following line to execute the cleanup:
-- DELETE FROM interface_composition_bees
-- WHERE audioSceneId NOT IN (SELECT id FROM audio_scenes);

-- After cleanup, verify no orphaned records remain:
-- SELECT COUNT(*) as orphaned_count
-- FROM interface_composition_bees icb
-- LEFT JOIN audio_scenes as ON icb.audioSceneId = as.id
-- WHERE as.id IS NULL;
