import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import { style } from "glamor";

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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--primary-300)",
          padding: 0,
          color: "var(--textColor)"
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "var(--primary-200)"
          },
          "&.Mui-selected": {
            backgroundColor: "var(--primary-400)"
          },
          "&.Mui-selected:hover": {
            backgroundColor: "var(--primary-400)"
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: "var(--white)",
          backgroundColor: "var(--primary-400)",
          border: "1px solid var(--primary-100)",
          outline: "none",
          borderRadius: "var(--radiusMedium)",
          '&:hover': {
            background: "var(--primary-400)",
          },
        },
        icon: {
          color: "var(--primary-100)",
        }
      },
      variants: [{
        props: { variant: "standard", size: "small" },
        style: {
          fontSize: "var(--smallText)",
          padding: "6px 7px 6px 10px"
        }
      }, {
        props: { variant: "standard", size: "medium" },
        style: {
          fontSize: "1rem",
          padding: "12x"
        }
      }]
    }
  },
});
