import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme";
import { AppLayout } from "./components/layout/AppLayout";
import { AppRoutes } from "./routes";
import { VideoPlayerProvider } from "./contexts/VideoPlayerContext";
import { VideoPlayerContainer } from "./components/player/VideoPlayerContainer";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  console.log("App rendering");
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <VideoPlayerProvider>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
            <VideoPlayerContainer />
          </VideoPlayerProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
