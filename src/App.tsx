import { RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { routes } from "./config/routes.config";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { EventsProvider } from "./contexts/EventsContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { verifyAWSConfiguration } from "./services/aws-client.verify";
import { useEffect } from "react";

const router = createBrowserRouter(routes);

function App() {
  useEffect(() => {
    // Verify AWS configuration on app startup
    verifyAWSConfiguration().then((result) => {
      if (result.success) {
        console.log("🚀 AWS Configuration Verified:", result.message);
      } else {
        console.error("❌ AWS Configuration Failed:", result.error);
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <SnackbarProvider>
        <AuthProvider>
          <NotificationProvider>
            <EventsProvider>
              <RouterProvider router={router} />
            </EventsProvider>
          </NotificationProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
