import { useBeeStore, usePositioningTargetSelector } from "@renderer/src/hooks";
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
  const activeBees = useBeeStore((state) => state.activeBees);
  const initializing = useBeeStore((state) => state.initializing);
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
      beeRadius: 2000,
      tagId: "",
      maxVolume: 1,
      maxVolumeZoneRadius: 500,
      easingIntervalTime: 20,
      updateRateEasingFactor: 0.75,
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

  if (initializing) return <div>Loading...</div>;

  if (activeBees.length === 0)
    return <div>There are no active bees available.</div>;

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
            min={100}
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
        <CardSection title="Advanced Settings" introduction="">
          <p style={{ marginBottom: "2rem" }}>
            The easing interval time (Z) will define how fast we send signals to
            the osc targets in milliseconds. When we want to set a new volume we
            do a linear increment from volume A to B over a duration (X time).
            The amount of signals send to the target is therefore t(B) - t(A) /
            Z or X / Z. The lower Z is, the more accurate the volume will be,
            but the more CPU power it will cost.
          </p>

          {/* Max Volume Radius */}
          <NumberSlider
            label="Easing interval time"
            marginBottom="2rem"
            labelWidth="200px"
            min={5}
            max={200}
            step={5}
            onChangeCommitted={(value) =>
              updateOptionsForAlgorithm({ easingIntervalTime: value })
            }
            value={targetsAndOptionsForAlgorithm.options.easingIntervalTime}
          />

          <p style={{ marginBottom: "2rem" }}>
            The update easing factor is a value that we use to multiply the
            positioning update rate labelWidth. If you have an update rate of
            300ms and a factor of 0.5, the easing will be calculated in a time
            frame of 300ms * 0.5 = 150ms. This prevents overlap between the
            update rate and the easing duration intervals in the background. Say
            that the calculation of easing lasts longer than the update rate,
            flaws can happen.
          </p>

          {/* Max Volume Radius */}
          <NumberSlider
            label="Update Easing Factor"
            marginBottom="2rem"
            labelWidth="200px"
            min={0.05}
            max={1}
            step={0.05}
            onChangeCommitted={(value) =>
              updateOptionsForAlgorithm({ updateRateEasingFactor: value })
            }
            value={targetsAndOptionsForAlgorithm.options.updateRateEasingFactor}
          />
        </CardSection>
      </Card>
    </CardVerticalStack>
  );
};
