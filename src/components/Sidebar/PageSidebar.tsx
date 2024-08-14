import React, { ReactElement, useEffect, useState } from "react";
import { ButtonProps } from "../Buttons/Button";
import { Box, TextField } from "@mui/material";

export interface PageSidebarProps {
  buttons?: ReactElement<ButtonProps>[];
  divider?: boolean;
  filterButtons?: boolean;
}

export const PageSidebar = ({
  buttons,
  divider = false,
  filterButtons = false,
}: PageSidebarProps) => {
  /**
   * Inner State
   */
  const [filteredButtons, setFilteredButtons] = useState<
    ReactElement<ButtonProps>[] | undefined
  >(buttons);
  const [currentFilter, setCurrentFilter] = useState<string>("");
  const [currentButtons, setCurrentButtons] = useState<
    ReactElement<ButtonProps>[] | undefined
  >(buttons);

  /**
   * When buttons change, set current buttons or change filter
   */

  useEffect(() => {
    setCurrentButtons(buttons);
  }, [buttons]);

  useEffect(() => {
    if (filterButtons) {
      setFilteredButtons(
        currentButtons?.filter((button) =>
          button.key?.toLowerCase().includes(currentFilter.toLowerCase())
        )
      );
    } else {
      setFilteredButtons(currentButtons);
    }
  }, [currentFilter, currentButtons]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={0}
      borderRight={divider ? "1px solid var(--grey-300)" : "none"}
    >
      {filterButtons && filteredButtons && (
        <TextField
          sx={{ marginBottom: "10px" }}
          autoFocus
          size="small"
          value={currentFilter}
          onChange={(event) => setCurrentFilter(event.target.value)}
        />
      )}
      {filteredButtons && <>{filteredButtons.map((button) => button)}</>}
    </Box>
  );
};
