/**
 * The Application Context Provider
 */

import { Loader } from "@components/Loader";
import { Alert, Snackbar } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { ToastMessage } from "../interfaces";
import { useShowState } from "../hooks/useShowState";
import { BuildHiveModal, BuildSwarmNestModal } from "../pages/BuildHiveModal/BuildHiveModal";

interface AppContextProviderProps {
  children: React.ReactNode
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [openBuildSwarmModal, setOpenBuildSwarmModal] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage>({ message: "", severity: "info"});
  const { open: openToast, handleOpen: handleOpenToast, handleClose: handleCloseToast } = useShowState(false);

  /**
   * A function that we'll pass to all the children
   * to add some yummy toasts
   */
  const showToast = useCallback(
    (toast: ToastMessage) => {
      setToast(toast);
      handleOpenToast();
    },
    [setToast]
  )

  /**
   * When hooking the application provider
   */
  useEffect(() => {
    // Handle an error
    window.kweenb.events.onError(
      (event, error) => {
        showToast({
          message: error.message,
          severity: "error"
        });
      }
    )

    // Handle an informative message
    window.kweenb.events.onInfo(
      (event, message) => {
        showToast({
          message,
          severity: "info"
        });
      }
    )

    // Handle an informative message
    window.kweenb.events.onSuccess(
      (event, message) => {
        showToast({
          message,
          severity: "success"
        });
      }
    )
  }, [])

  return (
    <AppContext.Provider value={{ setLoading, showToast, setOpenBuildSwarmModal }}>
      {/* The General Loader for the whole app */}
      {loading && <Loader />}

      {/* The Toast messages for the whole app */}
      <div>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right"}}
          open={openToast}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          message={toast.message}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </div>

      {/* The Build hive modal */}
      <BuildHiveModal open={openBuildSwarmModal} onClose={() => setOpenBuildSwarmModal(false)} />

      {/* The application itself */}
      {children}
    </AppContext.Provider>
  )
}
