import { useState, Suspense, ReactNode, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, useMediaQuery, useTheme, GlobalStyles } from "@mui/material";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import MobileNavigation from "./MobileNavigation";
import { LoadingState } from "../common/LoadingState";
import { ErrorBoundary } from "../common/ErrorBoundary";

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Debug logging for layout measurements
  useEffect(() => {
    // Log immediately and then after a delay to catch any dynamic changes
    const logMeasurements = () => {
      const mainElement = document.querySelector("main.MuiBox-root");
      const contentElement = mainElement?.querySelector(".MuiBox-root");

      console.log("📏 Layout Measurements:", {
        timestamp: new Date().toISOString(),
        mainElementTop: mainElement?.getBoundingClientRect().top,
        contentElementTop: contentElement?.getBoundingClientRect().top,
        mainElementPadding: mainElement
          ? getComputedStyle(mainElement).padding
          : null,
        contentElementPadding: contentElement
          ? getComputedStyle(contentElement).padding
          : null,
        viewportHeight: window.innerHeight,
        isMobile,
        pathname: location.pathname,
      });
    };

    // Log immediately
    logMeasurements();
    // Log after a delay to catch any dynamic updates
    setTimeout(logMeasurements, 100);
  }, [isMobile, location.pathname]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        backgroundColor: "background.default",
      }}
    >
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
            width: "100vw",
            overflowX: "hidden",
          },
          "#root": {
            minHeight: "100vh",
            width: "100vw",
            overflowX: "hidden",
          },
        }}
      />

      {/* Fixed Header */}
      <Header onMenuOpen={handleSidebarToggle} />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "background.default",
          pt: { xs: "56px", sm: "64px" }, // Add padding-top to account for header
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            flex: 1,
            width: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            p: { xs: 2, sm: 3 },
            pb: { xs: 10, sm: 3 }, // Extra padding for mobile navigation
          }}
        >
          <ErrorBoundary>
            <Suspense
              fallback={<LoadingState message="Loading page content..." />}
            >
              {children || <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Box>

      {/* Side Menu - Higher z-index than header */}
      <SideMenu
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary"
      />

      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}
    </Box>
  );
};

export default MainLayout;
