import { createTheme } from "@mui/material/styles";

export default createTheme({
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--primary-100)",
          "& .MuiTableCell-head": {
            color: "white",
            backgroundColor: "var(--primary-700)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: "var(--white)",
          borderBottom: "1px solid var(--primary-100)",
        },
      },
    },
  },
});
