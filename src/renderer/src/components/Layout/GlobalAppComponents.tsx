import { Loader } from "@components/Loader";
import React from "react";
import { AboutKweenBModal } from "../Modals/AboutKweenBModal";
import { Alert, Snackbar } from "@mui/material";
import { ConnectBeesModal } from "../Modals";
import { UploadAudioFilesSettings } from "../Modals/UploadAudioFilesSettings";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import { BeeDeviceManagerModal } from "../Modals/BeeDeviceManagerModal";

export const GlobalAppComponents = () => {
  const appMode = useAppStore((state) => state.appMode);
  const closeToast = useAppStore((state) => state.closeToast);
  const loading = useAppStore((state) => state.loading);

  const setOpenAboutKweenBModal = useAppStore(
    (state) => state.setOpenAboutKweenBModal
  );
  const openAboutKweenBModal = useAppStore(
    (state) => state.openAboutKweenBModal
  );
  const openBeeDeviceManagerModal = useAppStore(
    (state) => state.openBeeDeviceManagerModal
  );
  const openConnectBeesModal = useAppStore(
    (state) => state.openConnectBeesModal
  );
  const openDisconnectBeesModal = useAppStore(
    (state) => state.openDisconnectBeesModal
  );
  const openTriggerOnlyModal = useAppStore(
    (state) => state.openTriggerOnlyModal
  );
  const openToast = useAppStore((state) => state.openToastState);
  const openUploadAudioFilesSettings = useAppStore(
    (state) => state.openUploadAudioFilesSettings
  );
  const setLoading = useAppStore((state) => state.setLoading);
  const setOpenBeeDeviceManagerModal = useAppStore(
    (state) => state.setOpenBeeDeviceManagerModal
  );
  const setOpenConnectBeesModal = useAppStore(
    (state) => state.setOpenConnectBeesModal
  );
  const setOpenDisconnectBeesModal = useAppStore(
    (state) => state.setOpenDisconnectBeesModal
  );
  const setOpenTriggerOnlyModal = useAppStore(
    (state) => state.setOpenTriggerOnlyModal
  );
  const setOpenUploadAudioFilesSettings = useAppStore(
    (state) => state.setOpenUploadAudioFilesSettings
  );
  const toast = useAppStore((state) => state.toast);

  return (
    <>
      {/* The General Loader for the whole app */}
      {loading.loading && (
        <Loader
          text={loading.text}
          cancelButton={loading.cancelButton}
          onCancel={() => {
            setLoading({
              text: "",
              loading: false,
              onCancel: () => {},
              cancelButton: false,
            });
            if (loading.onCancel) loading.onCancel();
          }}
        />
      )}

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
              closeToast();
            }
          }}
          message={toast.message}
        >
          <Alert
            onClose={closeToast}
            severity={toast.severity}
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </div>

      {/* Open the connection window */}
      <ConnectBeesModal
        type={appMode === AppMode.Hub ? "HUB" : "P2P"}
        open={openConnectBeesModal}
        onClose={() => setOpenConnectBeesModal(false)}
      />

      {/* The Disconnect bees modal */}
      <ConnectBeesModal
        type={"DISCONNECT"}
        open={openDisconnectBeesModal}
        onClose={() => setOpenDisconnectBeesModal(false)}
      />

      {/* The Trigger Only bees modal */}
      <ConnectBeesModal
        type={"TRIGGER_ONLY"}
        open={openTriggerOnlyModal}
        onClose={() => setOpenTriggerOnlyModal(false)}
      />

      {/* The Upload Audio Files modal */}
      <UploadAudioFilesSettings
        open={openUploadAudioFilesSettings}
        onClose={() => setOpenUploadAudioFilesSettings(false)}
      ></UploadAudioFilesSettings>

      {/* The Bee Device Manager modal */}
      <BeeDeviceManagerModal
        open={openBeeDeviceManagerModal}
        onClose={() => setOpenBeeDeviceManagerModal(false)}
      ></BeeDeviceManagerModal>
    </>
  );
};
