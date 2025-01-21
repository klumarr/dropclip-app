import { createTheme, Components, Theme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9D4EDD",
      light: "#C77DFF",
      dark: "#7B2CBF",
    },
    secondary: {
      main: "#673ab7",
      dark: "#512da8",
    },
    background: {
      default: "#121212",
      paper: "#181818",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#9D4EDD40 #121212",
          "&::-webkit-scrollbar": {
            width: 12,
          },
          "&::-webkit-scrollbar-track": {
            background: "#121212",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9D4EDD40",
            borderRadius: 6,
            border: "3px solid #121212",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 500,
          textTransform: "none",
          fontSize: "0.9rem",
          fontWeight: 500,
          height: "40px",
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #9D4EDD, #673ab7) !important",
          boxShadow:
            "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
          "&:hover": {
            background: "linear-gradient(45deg, #7B2CBF, #512da8) !important",
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#181818",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
        },
      },
    },
  },
});
