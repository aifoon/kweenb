import { LabelHorizontalProps } from "@components/Layout/LabelHorizontal";
import { Box, Slider, Typography } from "@mui/material";
import React, { useEffect } from "react";

interface NumberSliderProps extends LabelHorizontalProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChangeCommitted?: (value: number) => void;
  showNumber?: boolean;
  orientation?: "horizontal" | "vertical";
  typographyVariant?: "superSmall" | "extraSmall" | "small" | "normal";
  sliderHeight?: string;
}

export const NumberSlider = ({
  min,
  max,
  label = "test",
  labelWidth = "100px",
  step = 5,
  value = 0,
  showNumber = true,
  typographyVariant = "normal",
  orientation = "horizontal",
  onChangeCommitted,
  sliderHeight = "200px",
  marginBottom = "15px",
}: NumberSliderProps) => {
  const [currentValue, setCurrentValue] = React.useState<number>(value);

  const changeValue = (e: Event, v: number | number[]) => {
    setCurrentValue(Array.isArray(v) ? v[0] : v);
  };

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const calculateGridTemplateRowsColumns = (): {
    templateRows: string;
    templateColumns: string;
  } => {
    if (orientation === "horizontal") {
      if (label && showNumber) {
        return {
          templateColumns: `${labelWidth} 1fr 75px`,
          templateRows: "auto",
        };
      } else if (label) {
        return {
          templateColumns: `${labelWidth} 1fr`,
          templateRows: "auto",
        };
      } else if (showNumber) {
        return {
          templateColumns: `1fr 75px`,
          templateRows: "auto",
        };
      }
    } else {
      if (label && showNumber) {
        return {
          templateColumns: `${labelWidth}`,
          templateRows: `25px ${sliderHeight} 20px`,
        };
      }
    }
    return {
      templateColumns: `1fr`,
      templateRows: "auto",
    };
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: calculateGridTemplateRowsColumns().templateColumns,
        gridTemplateRows: calculateGridTemplateRowsColumns().templateRows,
        gap: "20px",
        marginBottom,
      }}
    >
      {label && (
        <Box
          style={{
            textAlign: orientation == "horizontal" ? "left" : "center",
          }}
        >
          <Typography variant={typographyVariant}>{label}</Typography>
        </Box>
      )}
      <Box display={"flex"} justifyContent={"center"}>
        <Slider
          valueLabelDisplay="auto"
          defaultValue={0}
          value={currentValue}
          min={min}
          max={max}
          step={step}
          orientation={orientation}
          onChange={changeValue}
          onChangeCommitted={(e, v) => {
            if (onChangeCommitted)
              onChangeCommitted(Array.isArray(v) ? v[0] : v);
          }}
        />
      </Box>
      {showNumber && (
        <Box
          style={{
            textAlign: orientation == "horizontal" ? "right" : "center",
          }}
        >
          <Typography variant={typographyVariant}>{currentValue}</Typography>
        </Box>
      )}
    </div>
  );
};
