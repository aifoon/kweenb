import {
  TableCell,
  TableRow,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { IBee } from "@shared/interfaces";
import React, { useState } from "react";
import { SelectTag } from "./SelectTag";

type BeeTagProps = {
  bee: IBee;
  tags: string[];
  selected: string;
  onTagChange: (bee: IBee, pozyxTagId: string) => void;
};

export const BeeTagTableRow = ({
  bee,
  onTagChange,
  tags,
  selected,
}: BeeTagProps) => {
  const handleChange = (pozyxTagId: string) => {
    onTagChange(bee, pozyxTagId === "None" ? "" : pozyxTagId);
  };

  return (
    <TableRow>
      <TableCell>{bee.name}</TableCell>
      <TableCell align="right">
        <SelectTag onChange={handleChange} tags={tags} selected={selected} />
      </TableCell>
    </TableRow>
  );
};
