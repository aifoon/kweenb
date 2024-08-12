import { usePozyxData } from "@renderer/src/hooks";
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export const PositioningData = () => {
  const { gridRows } = usePozyxData();

  // if (!pozyxDataArray || pozyxDataArray.length === 0)
  //   return <div>Loading data...</div>;

  const columns: GridColDef[] = [
    {
      field: "tagId",
      headerName: "Tag ID",
      minWidth: 150,
      maxWidth: 150,
      flex: 0.5,
    },
    {
      field: "x",
      headerName: "X",
      headerAlign: "right",
      flex: 1,
      minWidth: 150,
      align: "right",
    },
    {
      field: "y",
      headerName: "Y",
      headerAlign: "right",
      flex: 1,
      minWidth: 150,
      align: "right",
    },
    {
      field: "z",
      headerName: "Z",
      headerAlign: "right",
      flex: 1,
      minWidth: 150,
      align: "right",
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        initialState={{
          sorting: {
            sortModel: [{ field: "tagId", sort: "asc" }],
          },
        }}
        hideFooter
        rows={gridRows}
        columns={columns}
      />
    </div>
  );
};
