import { createContext } from "react";
import { AppMode } from "@shared/enums";
import { ToastMessage } from "../interfaces";

/**
 * NOTE: not everything is converted to Zustand, this is a work in progress
 * The Application Context below is still using React Context
 */

export interface AppContextValue {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenBuildSwarmModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenCleanSwarmModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenConnectBeesModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDisconnectBeesModal: React.Dispatch<React.SetStateAction<boolean>>;
  setAppMode: React.Dispatch<React.SetStateAction<AppMode>>;
  showToast: (toast: ToastMessage) => void;
  appMode: AppMode;
}

export const AppContext = createContext<AppContextValue>({
  setLoading: () => {},
  setOpenBuildSwarmModal: () => {},
  setOpenCleanSwarmModal: () => {},
  setOpenConnectBeesModal: () => {},
  setOpenDisconnectBeesModal: () => {},
  setAppMode: () => {},
  showToast: () => {},
  appMode: AppMode.P2P,
});
