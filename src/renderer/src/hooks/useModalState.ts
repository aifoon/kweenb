/**
 * A Simple Modal State manager
 */

import { useState } from "react";

export function useModalState(isOpen: boolean) {
  const [openModal, setOpenModal] = useState(isOpen);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return { openModal, handleOpen, handleClose };
}
