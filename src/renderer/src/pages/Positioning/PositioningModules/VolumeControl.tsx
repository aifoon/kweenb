import { useBees, usePositioningTargetSelector } from "@renderer/src/hooks";
import React, { useState, useEffect, useMemo } from "react";
import { PositioningTargetTypeSelector } from "@components/Positioning/PositioningTargetSelector";
import {
  PositioningControllerAlgorithm,
  VolumeControlXYOptions,
} from "@shared/interfaces";
import { Card, CardVerticalStack, CardSection } from "@components/Cards";
import { NumberSlider } from "@components/Slider";
import { LabelHorizontal } from "@components/Layout/LabelHorizontal";
import { SelectTag } from "@components/Positioning/SelectTag";
import {
  ToggleButtonMatrix,
  ToggleButtonMatrixItem,
} from "@components/Buttons/ToggleButtonMatrix";

export const VolumeControl = () => {
  const { activeBees, loading } = useBees();
  const [tags, setTags] = useState<string[]>([]);
  const {
    handleOnPositioningTargetTypeChange,
    handleOnClear,
    handleOnSelection,
    targetsAndOptionsForAlgorithm,
    updateOptionsForAlgorithm,
  } = usePositioningTargetSelector<VolumeControlXYOptions>(
    PositioningControllerAlgorithm.VOLUME_CONTROL_XY,
    {
      bees: [],
      beeRadius: 0,
      tagId: "",
      maxVolume: 1,
      maxVolumeZoneRadius: 500,
    }
  );

  /**
   * Bee matrix
   */

  const toggleButtonMatrixItems: ToggleButtonMatrixItem[] = useMemo(
    () =>
      activeBees.map((bee) => ({
        id: bee.id.toString(),
        label: bee.name,
      })),
    [activeBees]
  );

  /**
   * Tags
   */

  useEffect(() => {
    window.kweenb.methods.positioning.getAllTagIds().then((allTags) => {
      setTags(allTags);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <CardVerticalStack>
      <PositioningTargetTypeSelector
        onPositioningTargetTypeChange={handleOnPositioningTargetTypeChange}
        onClear={handleOnClear}
        onSelection={handleOnSelection}
        selectedTargetTypes={targetsAndOptionsForAlgorithm?.targets}
      />
      <Card introduction="Select the distance tag that will control the volume. Then, select the bees and their radius in which they will be controlled via the distance tag.">
        <CardSection title="Distance from tag">
          <LabelHorizontal label="Tag" labelWidth="200px" marginBottom="2rem">
            {/* Reference Tag */}

            <SelectTag
              tags={tags}
              onChange={(pozyxTagId) =>
                updateOptionsForAlgorithm({ tagId: pozyxTagId })
              }
              selected={targetsAndOptionsForAlgorithm.options.tagId}
            />
          </LabelHorizontal>
        </CardSection>
        <CardSection title="Output bees">
          {/* ToggleButton Matrix */}

          <LabelHorizontal
            label="Targetted Bees"
            labelWidth="200px"
            marginBottom="2rem"
          >
            <ToggleButtonMatrix
              items={toggleButtonMatrixItems}
              selected={targetsAndOptionsForAlgorithm.options.bees.map((b) =>
                b.id.toString()
              )}
              onSelectionChanged={(ids) => {
                updateOptionsForAlgorithm({
                  bees: activeBees.filter((bee) =>
                    ids.includes(bee.id.toString())
                  ),
                });
              }}
            />
          </LabelHorizontal>

          {/* Distance Slider */}

          <NumberSlider
            label="Distance"
            labelWidth="200px"
            min={0}
            max={10000}
            step={100}
            onChangeCommitted={(value) =>
              updateOptionsForAlgorithm({ beeRadius: value })
            }
            value={targetsAndOptionsForAlgorithm.options.beeRadius}
          />
        </CardSection>
        <CardSection title="Maximum Volume">
          {/* Max Volume Radius */}
          <NumberSlider
            label="Max volume radius"
            marginBottom="2rem"
            labelWidth="200px"
            min={0}
            max={3000}
            step={100}
            onChangeCommitted={(value) =>
              updateOptionsForAlgorithm({ maxVolumeZoneRadius: value })
            }
            value={targetsAndOptionsForAlgorithm.options.maxVolumeZoneRadius}
          />

          <NumberSlider
            label="Max volume"
            labelWidth="200px"
            min={0}
            max={1}
            step={0.1}
            onChangeCommitted={(value) =>
              updateOptionsForAlgorithm({ maxVolume: value })
            }
            value={targetsAndOptionsForAlgorithm.options.maxVolume}
          />
        </CardSection>
      </Card>
    </CardVerticalStack>
  );
};
