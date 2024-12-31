import { Components, Theme } from "@mui/material/styles";

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "500px",
        textTransform: "none",
        fontSize: "0.9rem",
        fontWeight: 500,
        height: "40px",
      },
      containedPrimary: {
        background: "linear-gradient(45deg, #9c27b0, #673ab7) !important",
        boxShadow:
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
        "&:hover": {
          background: "linear-gradient(45deg, #7b1fa2, #512da8) !important",
        },
        "&.Mui-disabled": {
          opacity: 0.7,
          background: "rgba(255, 255, 255, 0.12) !important",
          color: "rgba(255, 255, 255, 0.3)",
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
};
