/**
 * The Application Context Provider
 */

import { Loader } from "@components/Loader";
import { Alert, Snackbar } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppMode } from "@shared/enums";
import { AppContext } from "./AppContext";
import { ToastMessage } from "../interfaces";
import { useShowState } from "../hooks";
import {
  BuildHiveModal,
  CleanHiveModal,
  ConnectBeesModal,
  DisconnectBeesModal,
} from "../pages/Modals";
import { AboutKweenBModal } from "../pages/Modals/AboutKweenBModal";
import { LoadingState } from "@shared/interfaces";
import { TriggerOnlyModal } from "../pages/Modals/TriggerOnlyModal";
import { UploadAudioFilesSettings } from "../pages/Modals/UploadAudioFilesSettings";

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [loading, setLoading] = useState<LoadingState>({
    loading: false,
    text: "",
  });
  const [openBuildSwarmModal, setOpenBuildSwarmModal] =
    useState<boolean>(false);
  const [openCleanSwarmModal, setOpenCleanSwarmModal] =
    useState<boolean>(false);
  const [openConnectBeesModal, setOpenConnectBeesModal] =
    useState<boolean>(false);
  const [openDisconnectBeesModal, setOpenDisconnectBeesModal] =
    useState<boolean>(false);
  const [openTriggerOnlyModal, setOpenTriggerOnlyModal] =
    useState<boolean>(false);
  const [openUploadAudioFilesSettings, setOpenUploadAudioFilesSettings] =
    useState<boolean>(false);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.P2P);
  const [openAboutKweenBModal, setOpenAboutKweenBModal] = useState(false);
  const [toast, setToast] = useState<ToastMessage>({
    message: "",
    severity: "info",
  });
  const {
    open: openToast,
    handleOpen: handleOpenToast,
    handleClose: handleCloseToast,
  } = useShowState(false);

  /**
   * A function that we'll pass to all the children
   * to add some yummy toasts
   */
  const showToast = useCallback(
    (_toast: ToastMessage) => {
      setToast(_toast);
      handleOpenToast();
    },
    [setToast]
  );

  /**
   * When hooking the application provider
   */
  useEffect(() => {
    // Get the app's version number

    // When we need to show the about kweenb window
    window.kweenb.events.onAboutKweenB(() => {
      setOpenAboutKweenBModal(true);
    });

    // Handle an error
    window.kweenb.events.onError((event, error) => {
      showToast({
        message: error.message,
        severity: "error",
      });
    });

    // Handle an informative message
    window.kweenb.events.onInfo((event, message) => {
      showToast({
        message,
        severity: "info",
      });
    });

    // Handle an informative message
    window.kweenb.events.onSuccess((event, message) => {
      showToast({
        message,
        severity: "success",
      });
    });

    // Handle the closing request
    window.kweenb.events.onClosing(() =>
      setLoading({ loading: true, text: "Closing application..." })
    );

    // Handle the loading event
    window.kweenb.events.onLoading((event, loading, text) => {
      setLoading({ loading, text });
    });

    // Handle a change in the app mode
    window.kweenb.events.onAppMode((event, _appMode) => {
      setAppMode(_appMode);
    });
  }, []);

  const appContextValue = useMemo(
    () => ({
      loading,
      setLoading,
      showToast,
      setOpenBuildSwarmModal,
      setOpenCleanSwarmModal,
      setOpenConnectBeesModal,
      setOpenDisconnectBeesModal,
      setOpenTriggerOnlyModal,
      setOpenUploadAudioFilesSettings,
      setAppMode,
      appMode,
    }),
    [appMode]
  );

  return (
    <AppContext.Provider value={appContextValue}>
      {/* The General Loader for the whole app */}
      {loading.loading && <Loader text={loading.text} />}

      {/* The About KweenB Modal */}
      <AboutKweenBModal
        onClose={() => setOpenAboutKweenBModal(false)}
        open={openAboutKweenBModal}
      />

      {/* The Toast messages for the whole app */}
      <div>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={openToast}
          autoHideDuration={3000}
          onClose={(event, reason) => {
            if (reason === "timeout") {
              handleCloseToast();
            }
          }}
          message={toast.message}
        >
          <Alert
            onClose={handleCloseToast}
            severity={toast.severity}
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </div>

      {appMode === AppMode.Hub && (
        <>
          {/* The Build hive modal */}
          <BuildHiveModal
            open={openBuildSwarmModal}
            onClose={() => setOpenBuildSwarmModal(false)}
          />

          {/* The Clean hive modal */}
          <CleanHiveModal
            open={openCleanSwarmModal}
            onClose={() => setOpenCleanSwarmModal(false)}
          />
        </>
      )}

      {appMode === AppMode.P2P && (
        <>
          {/* The Connect bees modal */}
          <ConnectBeesModal
            open={openConnectBeesModal}
            onClose={() => setOpenConnectBeesModal(false)}
          />

          {/* The Disconnect bees modal */}
          <DisconnectBeesModal
            open={openDisconnectBeesModal}
            onClose={() => setOpenDisconnectBeesModal(false)}
          />
        </>
      )}

      <TriggerOnlyModal
        open={openTriggerOnlyModal}
        onClose={() => setOpenTriggerOnlyModal(false)}
      ></TriggerOnlyModal>

      <UploadAudioFilesSettings
        open={openUploadAudioFilesSettings}
        onClose={() => setOpenUploadAudioFilesSettings(false)}
      ></UploadAudioFilesSettings>

      {/* The application itself */}
      {children}
    </AppContext.Provider>
  );
};
