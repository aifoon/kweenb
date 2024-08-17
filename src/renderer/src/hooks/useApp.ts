import { useEffect } from "react";
import { useAppStore } from "../hooks/useAppStore";
import { AppMode } from "@shared/enums";

export const useApp = () => {
  const setAppMode = useAppStore((state) => state.setAppMode);
  const setOpenAboutKweenBModal = useAppStore(
    (state) => state.setOpenAboutKweenBModal
  );
  const showToast = useAppStore((state) => state.showToast);
  const setLoading = useAppStore((state) => state.setLoading);

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
      console.log("loading", loading, text);
      setLoading({ loading, text, cancelButton: false });
    });

    // Handle a change in the app mode
    window.kweenb.events.onAppMode((event, _appMode) => {
      setAppMode(_appMode as AppMode);
    });
  }, []);
};

export default useApp;
