import { createTheme } from "@mui/material/styles";
import { components } from "./components";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9c27b0",
      dark: "#7b1fa2",
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
      disabled: "rgba(255, 255, 255, 0.5)",
    },
  },
  components,
});
