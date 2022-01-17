import styled from "styled-components";
import InputBase from "@mui/material/InputBase";

export const MuiBootstrapInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    position: "relative",
    color: "var(--textColor)",
    backgroundColor: "var(--primary-100)",
    border: "1px solid var(--primary-400)",
    fontSize: "1rem",
    padding: "10px",
    fontFamily: ["Open Sans", "sans-serif"].join(","),
  },
  "& .MuiInputBase-input:focus": {
    borderRadius: "var(--radiusMedium)",
  },
  "& .MuiSvgIcon-root": {
    color: "var(--primary-100)",
  },
}));
