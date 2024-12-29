import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9D4EDD",
      light: "#C77DFF",
      dark: "#7B2CBF",
    },
    secondary: {
      main: "#5A189A",
      light: "#7B2CBF",
      dark: "#3C096C",
    },
    background: {
      default: "#000000",
      paper: "#121212",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#9D4EDD40 #000000",
          "&::-webkit-scrollbar": {
            width: 12,
          },
          "&::-webkit-scrollbar-track": {
            background: "#000000",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9D4EDD40",
            borderRadius: 6,
            border: "3px solid #000000",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 500,
          padding: "8px 32px",
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  },
});
