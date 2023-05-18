import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Grid, ToggleButton } from "@mui/material";
// import { ToggleButton } from "./ToggleButton";
import { ButtonSize, ButtonType, ButtonUse } from "./Button";

export type ToggleButtonMatrixItem = {
  id: string;
  label: string;
};

export type ToggleButtonMatrixProps = {
  items: ToggleButtonMatrixItem[];
  selected?: string[];
  onButtonSelected?: (id: string) => void;
  onButtonDeslected?: (id: string) => void;
  onSelectionChanged?: (ids: string[]) => void;
};

const ToggleButttonMatrixGrid = styled.div`
  margin-bottom: 30px;
`;

export const ToggleButtonMatrix = ({
  items,
  selected,
  onButtonDeslected,
  onButtonSelected,
  onSelectionChanged,
}: ToggleButtonMatrixProps) => {
  const [currentItems, setCurrentItems] =
    useState<ToggleButtonMatrixItem[]>(items);
  const [selectedItems, setSelectedItems] = useState<string[]>(selected || []);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    selectedId: string
  ) => {
    if (selectedItems.includes(selectedId)) {
      setSelectedItems((previousSelectedItems) =>
        previousSelectedItems.filter((id) => id !== selectedId)
      );
      if (onButtonDeslected) onButtonDeslected(selectedId);
    } else {
      setSelectedItems((previousSelectedItems) => [
        ...previousSelectedItems,
        selectedId,
      ]);

      if (onButtonSelected) onButtonSelected(selectedId);
    }
  };

  useEffect(() => {
    if (onSelectionChanged) onSelectionChanged(selectedItems);
  }, [selectedItems]);

  return (
    <ToggleButttonMatrixGrid>
      <Grid container spacing={2}>
        {currentItems.map((item) => (
          <Grid item xs={6} md={6} lg={2} xl={1}>
            <ToggleButton
              style={{ width: "100%" }}
              selected={selectedItems.includes(item.id)}
              key={item.id}
              value={item.id}
              onChange={handleChange}
            >
              {item.label}
            </ToggleButton>
          </Grid>
        ))}
      </Grid>
    </ToggleButttonMatrixGrid>
  );
};
