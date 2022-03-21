/**
 * A Simple Modal State manager
 */

import { useState } from "react";

export function useShowState(isOpen: boolean) {
  const [open, setOpen] = useState(isOpen);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return { open, handleOpen, handleClose };
}
