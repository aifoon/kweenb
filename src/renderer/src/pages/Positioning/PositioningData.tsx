import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { usePozyxData } from "@renderer/src/hooks";
import React from "react";

export const PositioningData = () => {
  const { pozyxDataArray } = usePozyxData();

  if (!pozyxDataArray || pozyxDataArray.length === 0)
    return <div>Loading data...</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Tag ID</TableCell>
          <TableCell align="right">X</TableCell>
          <TableCell align="right">Y</TableCell>
          <TableCell align="right">Z</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {pozyxDataArray.map((pozyxData) => (
          <TableRow key={pozyxData.tagId}>
            <TableCell>{pozyxData.tagId}</TableCell>
            <TableCell align="right">{pozyxData.data.coordinates.x}</TableCell>
            <TableCell align="right">{pozyxData.data.coordinates.y}</TableCell>
            <TableCell align="right">{pozyxData.data.coordinates.z}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
