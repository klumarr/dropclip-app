import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import { theme } from "./styles/theme";

// Import AWS configuration
import "./config/aws/amplify.config";

// Debug: Log environment variables
console.log("Environment:", {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  region: import.meta.env.VITE_AWS_REGION,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
