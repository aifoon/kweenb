/**
 * Hook that is responsible for mutating one setting
 */

import { useEffect, useState } from "react";
import { IPozyxData } from "@shared/interfaces";
import { IpcMessageEvent } from "electron";
import { GridValidRowModel } from "@mui/x-data-grid";

export function usePozyxData() {
  const [currentPozyxData, setCurrentPozyxData] = useState<
    Map<string, IPozyxData>
  >(new Map<string, IPozyxData>());
  const [gridRows, setGridRows] = useState<GridValidRowModel[]>([]);

  /**
   * Subscribe to pozyx data when hook is mounted
   */
  useEffect(() => {
    const removeListener = window.kweenb.events.onPozyxData(
      (event: IpcMessageEvent, pozyxData: Map<string, IPozyxData>) => {
        // calculate the pozyx data array
        const pozyxDataArray = Array.from(pozyxData.values());
        const pozyxGridRows = pozyxDataArray.map(({ tagId, data }) => ({
          id: tagId,
          tagId,
          x: data.coordinates.x,
          y: data.coordinates.y,
          z: data.coordinates.z,
        }));

        // set the raw pozyx data
        setCurrentPozyxData(pozyxData);

        //
        setGridRows(pozyxGridRows);
      }
    );
    return removeListener;
  }, []);

  return {
    currentPozyxData,
    gridRows,
  };
}
