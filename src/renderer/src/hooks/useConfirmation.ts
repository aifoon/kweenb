/**
 * A simple confirmation state manager
 */

import { useState } from "react";

export function useConfirmation<T>(isOpen: boolean, defaultValue: T) {
  const [open, setOpen] = useState(isOpen);
  const [confirmationData, setConfirmationData] = useState<T>(defaultValue);

  const handleOpen = (data: T) => {
    setConfirmationData(data);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setConfirmationData(defaultValue);
  };

  return { open, confirmationData, handleOpen, handleClose };
}
