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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <VideoPlayerProvider>
          <Router>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
            <VideoPlayerContainer />
          </Router>
        </VideoPlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
