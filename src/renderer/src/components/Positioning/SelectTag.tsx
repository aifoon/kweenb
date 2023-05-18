import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import React, { useEffect, useState } from "react";

export type SelectTagProps = {
  tags: string[];
  selected?: string;
  onChange?: (pozyxTagId: string) => void;
};

export const SelectTag = ({ tags, selected, onChange }: SelectTagProps) => {
  const [selectedTag, setSelectedTag] = useState(selected || "None");
  const innerTags = ["None", ...tags];

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedTag(event.target.value);
    if (onChange) {
      onChange(event.target.value === "None" ? "" : event.target.value);
    }
  };

  useEffect(() => {
    setSelectedTag(selected || "None");
  }, [selected]);

  return (
    <Select
      defaultValue="None"
      value={selectedTag}
      size="small"
      onChange={handleChange}
    >
      {innerTags.map((tag) => (
        <MenuItem key={tag} value={tag}>
          {tag}
        </MenuItem>
      ))}
    </Select>
  );
};
