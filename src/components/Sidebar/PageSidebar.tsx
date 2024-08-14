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
  const [filteredButtons, setFilteredButtons] = useState<
    ReactElement<ButtonProps>[] | undefined
  >(buttons);
  const [currentFilter, setCurrentFilter] = useState<string>("");

  useEffect(() => {
    if (filterButtons) {
      setFilteredButtons(
        buttons?.filter((button) =>
          button.key?.toLowerCase().includes(currentFilter.toLowerCase())
        )
      );
    }
  }, [currentFilter]);

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
