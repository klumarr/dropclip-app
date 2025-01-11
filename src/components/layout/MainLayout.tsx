import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, useMediaQuery, useTheme, GlobalStyles } from "@mui/material";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import MobileNavigation from "./MobileNavigation";

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  console.log("📱 MainLayout:", {
    isMobile,
    isSidebarOpen,
    pathname: location.pathname,
    screenWidth: window.innerWidth,
  });

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            margin: 0,
            padding: 0,
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
            width: "100vw",
            overflowX: "hidden",
            overflowY: "auto",
          },
          "#root": {
            minHeight: "100vh",
            width: "100vw",
            overflowX: "hidden",
            overflowY: "auto",
          },
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100vw",
          backgroundColor: "background.default",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Header onMenuOpen={handleSidebarToggle} />

        <Box
          sx={{
            display: "flex",
            flex: 1,
            position: "relative",
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          <SideMenu
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            variant="temporary"
          />

          <Box
            component="main"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowX: "hidden",
              overflowY: "auto",
              position: "relative",
              p: { xs: 1.5, sm: 3 },
              pb: { xs: 7, sm: 3 },
              width: "100%",
            }}
          >
            <Outlet />
          </Box>
        </Box>

        {isMobile && <MobileNavigation />}
      </Box>
    </>
  );
};

export default MainLayout;
