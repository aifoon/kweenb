import { Loader } from "@components/Loader";
import React from "react";
import { AboutKweenBModal } from "../Modals/AboutKweenBModal";
import { Alert, Snackbar } from "@mui/material";
import {
  BuildHiveModal,
  ConnectBeesModal,
  DisconnectBeesModal,
} from "../Modals";
import { TriggerOnlyModal } from "../Modals/TriggerOnlyModal";
import { UploadAudioFilesSettings } from "../Modals/UploadAudioFilesSettings";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";

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
  const openBuildSwarmModal = useAppStore(
    (state) => state.openConnectBeesHubModal
  );
  const openConnectBeesModal = useAppStore(
    (state) => state.openConnectBeesP2PModal
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
  const setOpenBuildSwarmModal = useAppStore(
    (state) => state.setOpenConnectBeesHubModal
  );
  const setOpenConnectBeesModal = useAppStore(
    (state) => state.setOpenConnectBeesP2PModal
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

      {appMode === AppMode.Hub && (
        <>
          {/* The Build hive modal */}
          <BuildHiveModal
            open={openBuildSwarmModal}
            onClose={() => setOpenBuildSwarmModal(false)}
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
        </>
      )}

      {/* The Disconnect bees modal */}
      <DisconnectBeesModal
        open={openDisconnectBeesModal}
        onClose={() => setOpenDisconnectBeesModal(false)}
      />

      <TriggerOnlyModal
        open={openTriggerOnlyModal}
        onClose={() => setOpenTriggerOnlyModal(false)}
      ></TriggerOnlyModal>

      <UploadAudioFilesSettings
        open={openUploadAudioFilesSettings}
        onClose={() => setOpenUploadAudioFilesSettings(false)}
      ></UploadAudioFilesSettings>
    </>
  );
};
