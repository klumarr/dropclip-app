import { BrowserRouter, useRoutes } from "react-router-dom";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { routes } from "./config/routes.config";
import { Suspense } from "react";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { VideoPlayerProvider } from "./contexts/VideoPlayerContext";
import { NotificationProvider } from "./contexts/NotificationContext";

const AppRoutes = () => {
  const element = useRoutes(routes);
  return <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <VideoPlayerProvider>
              <AppRoutes />
            </VideoPlayerProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
