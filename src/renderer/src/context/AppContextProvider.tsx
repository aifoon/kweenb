/**
 * The Application Context Provider
 */

import { Loader } from "@components/Loader";
import { Alert, Snackbar } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { ToastMessage } from "../interfaces";

interface AppContextProviderProps {
  children: React.ReactNode
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage>({ message: "", severity: "info"});
  const [openToast, setOpenToast] = useState<boolean>(false);

  /**
   * A function that we'll pass to all the children
   * to add some yummy toasts
   */
  const showToast = useCallback(
    (toast) => {
      setToast(toast);
      setOpenToast(true);
    },
    [setToast]
  )

  return (
    <AppContext.Provider value={{ setLoading, showToast }}>
      {/* The General Loader for the whole app */}
      {loading && <Loader />}

      {/* The Toast messages for the whole app */}
      <div>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right"}}
          open={openToast}
          autoHideDuration={3000}
          onClose={() => setOpenToast(false)}
          message={toast.message}
        >
          <Alert onClose={() => setOpenToast(false)} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </div>

      {/* The application itself */}
      {children}
    </AppContext.Provider>
  )
}
