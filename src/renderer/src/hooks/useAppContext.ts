/**
 * The Application Context
 */

import { AppContext } from "@renderer/src/context/AppContext";
import { useContext } from "react";

export function useAppContext() {
  const appContext = useContext(AppContext);
  return { appContext };
}
