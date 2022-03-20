import { createContext } from "react";
import { ToastMessage } from "../interfaces";

export interface AppContextValue {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (toast: ToastMessage) => void;
}

export const AppContext = createContext<AppContextValue>({
  setLoading: () => {},
  showToast: () => {},
});
