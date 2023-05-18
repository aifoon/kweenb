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
    { bees: [], beeRadius: 0, tagId: "" }
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
          <LabelHorizontal label="Tag" labelWidth="150px" marginBottom="2rem">
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
        <CardSection title="Select output bees">
          {/* ToggleButton Matrix */}

          <LabelHorizontal
            label="Targetted Bees"
            labelWidth="150px"
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
            labelWidth="150px"
            min={0}
            max={10000}
            step={100}
            onChangeCommitted={(value) =>
              updateOptionsForAlgorithm({ beeRadius: value })
            }
            value={targetsAndOptionsForAlgorithm.options.beeRadius}
          />
        </CardSection>
      </Card>
    </CardVerticalStack>
  );
};
