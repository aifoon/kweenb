/**
 * Hook that is responsible for mutating one setting
 */

import { useEffect, useMemo, useState } from "react";
import { IPozyxData } from "@shared/interfaces";
import { IpcMessageEvent } from "electron";
import { Utils } from "@shared/utils";

export function usePozyxData() {
  const [pozyxData, setPozyxData] = useState<Map<string, IPozyxData>>(new Map<string, IPozyxData>());
  const [pozyxDataArray, setPozyxDataArray] = useState<IPozyxData[]>([]);

  /**
  * Subscribe to pozyx data when hook is mounted
  */
  useEffect(() => {
    const removeListener = window.kweenb.events.onPozyxData((event: IpcMessageEvent, pozyxData: Map<string, IPozyxData>) => {
      setPozyxData(pozyxData);
      setPozyxDataArray(Array.from(pozyxData.values()));
    });
    return removeListener;
  }, []);

  return { pozyxData, pozyxDataArray };
}