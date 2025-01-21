import { ThemeProvider } from "@mui/material/styles";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { EventsProvider } from "./contexts/EventsContext";
import { SignInModalProvider } from "./hooks/useSignInModal";
import { theme } from "./theme";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./config/routes.config";
import CssBaseline from "@mui/material/CssBaseline";

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <SignInModalProvider>
              <EventsProvider>
                <RouterProvider router={router} />
              </EventsProvider>
            </SignInModalProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
