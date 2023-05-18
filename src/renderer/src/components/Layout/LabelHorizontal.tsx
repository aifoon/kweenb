import React from "react";

export type LabelHorizontalProps = {
  label?: string;
  labelWidth?: string;
  marginBottom?: string;
  children?: React.ReactNode;
};

export const LabelHorizontal = ({
  label,
  labelWidth = "100px",
  marginBottom = "40px",
  children,
}: LabelHorizontalProps) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `${label ? labelWidth : ""} 1fr`,
      alignItems: "center",
      marginBottom,
    }}
  >
    {label && <div>{label}</div>}
    <div>{children}</div>
  </div>
);
