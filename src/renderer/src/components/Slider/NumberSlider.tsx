import { LabelHorizontalProps } from "@components/Layout/LabelHorizontal";
import { Slider } from "@mui/material";
import React, { useEffect } from "react";

interface NumberSliderProps extends LabelHorizontalProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChangeCommitted?: (value: number) => void;
  showNumber?: boolean;
}

export const NumberSlider = ({
  min,
  max,
  label,
  labelWidth = "100px",
  step = 5,
  value = 0,
  showNumber = true,
  onChangeCommitted,
  marginBottom = "15px",
}: NumberSliderProps) => {
  const [currentValue, setCurrentValue] = React.useState<number>(value);

  const changeValue = (e: Event, v: number | number[]) => {
    setCurrentValue(Array.isArray(v) ? v[0] : v);
  };

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${label ? labelWidth : ""} 1fr ${
          showNumber ? "75px" : ""
        }`,
        marginBottom,
      }}
    >
      {label && <div>{label}</div>}
      <div>
        <Slider
          valueLabelDisplay="auto"
          defaultValue={0}
          value={currentValue}
          min={min}
          max={max}
          step={step}
          onChange={changeValue}
          onChangeCommitted={(e, v) => {
            if (onChangeCommitted)
              onChangeCommitted(Array.isArray(v) ? v[0] : v);
          }}
        />
      </div>
      {showNumber && <div style={{ textAlign: "right" }}>{currentValue}</div>}
    </div>
  );
};
