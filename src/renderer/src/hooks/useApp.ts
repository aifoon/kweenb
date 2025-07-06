import { useEffect } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { useBeeStore } from "../hooks/useBeeStore";
import { AppMode, AppViews } from "@shared/enums";

export const useApp = () => {
  const setAppMode = useAppStore((state) => state.setAppMode);
  const setAppView = useAppStore((state) => state.setAppView);
  const setLoading = useAppStore((state) => state.setLoading);
  const setOpenAboutKweenBModal = useAppStore(
    (state) => state.setOpenAboutKweenBModal
  );
  const showToast = useAppStore((state) => state.showToast);

  useEffect(() => {
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

    // Stop polling when the app is closing
    window.kweenb.events.onAppClosing(() => {
      useBeeStore.getState().stopPolling();
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
      setLoading({ loading, text, cancelButton: false });
    });

    // Handle a change in the app mode
    window.kweenb.events.onAppMode((event, appMode) => {
      setAppMode(appMode as AppMode);
    });

    window.kweenb.events.onShowView((event, appView, show) => {
      setAppView(appView as AppViews, show);
    });
  }, []);
};

export default useApp;
