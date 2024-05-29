import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import { style } from "glamor";
import type {} from "@mui/x-data-grid/themeAugmentation";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    superSmall: React.CSSProperties;
    extraSmall: React.CSSProperties;
    small: React.CSSProperties;
    normal: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    superSmall: React.CSSProperties;
    extraSmall: React.CSSProperties;
    small: React.CSSProperties;
    normal: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    superSmall: true;
    extraSmall: true;
    small: true;
    normal: true;
  }
}

export default createTheme({
  typography: {
    superSmall: {
      fontSize: "0.5rem",
    },
    extraSmall: {
      fontSize: "0.7rem",
    },
    small: {
      fontSize: "0.9rem",
    },
    normal: {
      fontSize: "1rem",
    },
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: "h1",
          h2: "h2",
          h3: "h3",
          h4: "h4",
          h5: "h5",
          h6: "h6",
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        fontSizeSmall: "1rem",
        fontSizeInherit: "1.25rem",
        fontSizeLarge: "1.5rem",
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: "var(--buttonTextColor)",
          backgroundColor: "var(--secondary-500)",
          textTransform: "uppercase",
          outline: "none",
          border: "none",
          fontWeight: 600,
          borderRadius: "var(--radiusMedium)",
          padding: "var(--mediumButtonPadding)",
          cursor: "pointer",
          boxShadow: "none",
          fontSize: "1rem",
          transition: "0.1s ease-in-out opacity",
        },
      },
      variants: [
        {
          props: {
            variant: "contained",
            size: "small",
            color: "primary",
          },
          style: {
            fontSize: "var(--smallText)",
            padding: "var(--smallButtonPadding)",
            lineHeight: "normal",
            "&:hover": {
              backgroundColor: "var(--secondary-500)",
            },
          },
        },
        {
          props: {
            variant: "contained",
            size: "medium",
            color: "primary",
          },
          style: {
            "&:hover": {
              backgroundColor: "var(--secondary-500)",
            },
          },
        },
        {
          props: {
            variant: "contained",
            size: "small",
            color: "secondary",
          },
          style: {
            fontSize: "var(--smallText)",
            padding: "var(--smallButtonPadding)",
            lineHeight: "normal",
            backgroundColor: "var(--primary-200)",
            "&:hover": {
              backgroundColor: "var(--primary-300)",
            },
          },
        },
        {
          props: {
            variant: "text",
            size: "small",
            color: "primary",
          },
          style: {
            fontSize: "var(--smallText)",
            padding: "var(--smallButtonPadding)",
            lineHeight: "normal",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "var(--primary-300)",
            },
          },
        },
        {
          props: {
            variant: "text",
            size: "small",
            color: "secondary",
          },
          style: {
            fontSize: "var(--smallText)",
            padding: "var(--smallButtonPadding)",
            lineHeight: "normal",
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "var(--primary-300)",
            },
          },
        },
      ],
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "var(--primary-100)",
          "&.Mui-checked": {
            color: "var(--primary-100)",
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--primary-100)",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        columnHeader: {
          backgroundColor: "var(--primary-100)",
          textAlign: "right",
          padding: "1rem",
        },

        cell: {
          borderBottom: "1px solid var(--primary-100)",
          padding: "1rem",
        },
        root: {
          border: "none",
          color: "var(--white)",
        },
      },
    },
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
          color: "var(--textColor)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "var(--primary-200)",
          },
          "&.Mui-selected": {
            backgroundColor: "var(--primary-400)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "var(--primary-400)",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          border: "1px solid var(--primary-100)",
          color: "var(--white)",
          padding: "6px",
          borderRadius: "var(--radiusMedium)",
          "&.Mui-selected": {
            backgroundColor: "var(--primary-300)",
            color: "var(--white)",
            "&:hover": {
              backgroundColor: "var(--primary-400)",
            },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        track: {
          backgroundColor: "var(--primary-400)",
          border: "none",
        },
        rail: {
          backgroundColor: "var(--primary-100)",
        },
        thumb: {
          backgroundColor: "var(--primary-100)",
          "&:hover": {
            backgroundColor: "var(--primary-100)",
            boxShadow: "0 0 0 10px rgba(34, 34, 58, .5) !important",
          },
          "&:active": {
            boxShadow: "0 0 0 10px rgba(34, 34, 58, .5) !important",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "var(--primary-200)",
            // borderRadius: "var(--radiusMedium)",
          },
          "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              border: "none",
              borderRadius: "var(--radiusMedium)",
            },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "none",
            borderRadius: "var(--radiusMedium)",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: "var(--white)",
          backgroundColor: "var(--primary-400)",
          border: "1px solid var(--primary-100)",
          outline: "none",
          borderRadius: "var(--radiusMedium)",
          "&:hover": {
            background: "transparent",
            borderRadius: "var(--radiusMedium)",
            border: "1px solid var(--primary-100)",
          },
        },
        icon: {
          color: "var(--primary-100)",
        },
      } as any,
      variants: [
        {
          props: { variant: "standard", size: "small" },
          style: {
            fontSize: "var(--smallText)",
            padding: "6px 7px 6px 10px",
          },
        },
        {
          props: { variant: "standard", size: "medium" },
          style: {
            fontSize: "1rem",
            padding: "12x",
          },
        },
      ],
    },
  },
});
