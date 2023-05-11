import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import React from "react";

type PositioningDataProps = {};

export const PositioningData = (props: PositioningDataProps) => (
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
      <TableRow>
        <TableCell>102364</TableCell>
        <TableCell align="right">100</TableCell>
        <TableCell align="right">200</TableCell>
        <TableCell align="right">300</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
