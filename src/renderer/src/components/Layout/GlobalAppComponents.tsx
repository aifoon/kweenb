import { Loader } from "@components/Loader";
import { AboutKweenBModal } from "../Modals/AboutKweenBModal";
import { Alert, Snackbar } from "@mui/material";
import { ConnectBeesModal } from "../Modals";
import { UploadAudioFilesSettings } from "../Modals/UploadAudioFilesSettings";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import { BeeDeviceManagerModal } from "../Modals/BeeDeviceManagerModal";
import { SaveSoundsModal } from "../Modals/SaveSoundsModal";
import { CloudBackupModal } from "../Modals/CloudBackupModal";
import { RemoteInterfaceModal } from "../Modals/RemoteInterfaceModal";
import { SendToSatelliteModal } from "../Modals/SendToSatelliteModal";
import { CheckForUpdatesModal } from "../Modals/CheckForUpdatesModal";
import { RestoreSoundsModal } from "../Modals/RestoreSoundsModal";
import { NewSpeakerModal } from "../ManageBees/NewSpeakerModal";
import { FlashSpeakerModal } from "../ManageBees/FlashSpeakerModal";
import { AdoptFromNetworkModal } from "../ManageBees/AdoptFromNetworkModal";

export const GlobalAppComponents = () => {
  const appMode = useAppStore((state) => state.appMode);
  const closeToast = useAppStore((state) => state.closeToast);
  const loading = useAppStore((state) => state.loading);

  const setOpenAboutKweenBModal = useAppStore(
    (state) => state.setOpenAboutKweenBModal
  );
  const openAdoptModal = useAppStore((state) => state.openAdoptModal);
  const setOpenAdoptModal = useAppStore((state) => state.setOpenAdoptModal);
  const openFlashSpeakerModal = useAppStore(
    (state) => state.openFlashSpeakerModal
  );
  const flashKind = useAppStore((state) => state.flashKind);
  const setOpenFlashSpeakerModal = useAppStore(
    (state) => state.setOpenFlashSpeakerModal
  );
  const openNewSpeakerModal = useAppStore((state) => state.openNewSpeakerModal);
  const setOpenNewSpeakerModal = useAppStore(
    (state) => state.setOpenNewSpeakerModal
  );
  const openSaveSoundsModal = useAppStore((state) => state.openSaveSoundsModal);
  const openSendToSatelliteModal = useAppStore(
    (state) => state.openSendToSatelliteModal
  );
  const setOpenSendToSatelliteModal = useAppStore(
    (state) => state.setOpenSendToSatelliteModal
  );
  const openCheckForUpdatesModal = useAppStore(
    (state) => state.openCheckForUpdatesModal
  );
  const setOpenCheckForUpdatesModal = useAppStore(
    (state) => state.setOpenCheckForUpdatesModal
  );
  const openRemoteInterfaceModal = useAppStore(
    (state) => state.openRemoteInterfaceModal
  );
  const setOpenRemoteInterfaceModal = useAppStore(
    (state) => state.setOpenRemoteInterfaceModal
  );
  const openCloudBackupModal = useAppStore(
    (state) => state.openCloudBackupModal
  );
  const setOpenCloudBackupModal = useAppStore(
    (state) => state.setOpenCloudBackupModal
  );
  const restoreSoundsFrom = useAppStore((state) => state.restoreSoundsFrom);
  const setRestoreSoundsFrom = useAppStore(
    (state) => state.setRestoreSoundsFrom
  );
  const setOpenSaveSoundsModal = useAppStore(
    (state) => state.setOpenSaveSoundsModal
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

      {/* Flashing a speaker (File menu), followed by adopting it */}
      <FlashSpeakerModal
        open={openFlashSpeakerModal}
        kind={flashKind}
        onClose={() => setOpenFlashSpeakerModal(false)}
        onSetUpSpeaker={() => {
          setOpenFlashSpeakerModal(false);
          setOpenNewSpeakerModal(true);
        }}
        onSendToSatellite={() => {
          setOpenFlashSpeakerModal(false);
          setOpenSendToSatelliteModal(true);
        }}
      />

      {/* Adopting a new speaker (bees page and File menu) */}
      <NewSpeakerModal
        open={openNewSpeakerModal}
        onClose={() => setOpenNewSpeakerModal(false)}
      />

      {/* Finding the bees on the network and adding them (File menu) */}
      <AdoptFromNetworkModal
        open={openAdoptModal}
        onClose={() => setOpenAdoptModal(false)}
      />

      {/* Saving the sounds of all bees (bees page and File menu) */}
      <SaveSoundsModal
        open={openSaveSoundsModal}
        onClose={() => setOpenSaveSoundsModal(false)}
      />

      {/* The copy of the saved sounds in the cloud (File menu) */}
      <CloudBackupModal
        open={openCloudBackupModal}
        onClose={() => setOpenCloudBackupModal(false)}
      />

      {/* Where to open the remote interface, with a QR code (File menu) */}
      <RemoteInterfaceModal
        open={openRemoteInterfaceModal}
        onClose={() => setOpenRemoteInterfaceModal(false)}
      />

      {/* Bringing the satellite in line with KweenB (File menu) */}
      <SendToSatelliteModal
        open={openSendToSatelliteModal}
        onClose={() => setOpenSendToSatelliteModal(false)}
      />

      {/* A new KweenB, and new firmware for bees and satellites (File menu) */}
      <CheckForUpdatesModal
        open={openCheckForUpdatesModal}
        onClose={() => setOpenCheckForUpdatesModal(false)}
      />

      {/* Restoring several bees, from the cloud or this computer (File menu) */}
      <RestoreSoundsModal
        open={restoreSoundsFrom !== null}
        source={restoreSoundsFrom || "computer"}
        onClose={() => setRestoreSoundsFrom(null)}
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
