import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { usePozyxData } from "@renderer/src/hooks";
import { IPozyxData } from "@shared/interfaces";
import React, { useEffect } from "react";

type PositioningDataProps = {};

export const PositioningData = (props: PositioningDataProps) => {
  const { pozyxDataArray } = usePozyxData();

  if(!pozyxDataArray || pozyxDataArray.length === 0) return(<div>No data</div>)

  return(
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
          )
        )}
      </TableBody>
    </Table>
  )
};
