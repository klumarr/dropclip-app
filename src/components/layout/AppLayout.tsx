import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { MobileNavigation } from "./MobileNavigation";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { VideoPlayerContainer } from "../player/VideoPlayerContainer";

const MainContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "auto",
  backgroundColor: theme.palette.background.default,
  backgroundImage: "linear-gradient(rgba(0,0,0,0.6) 0%, rgb(0,0,0) 100%)",
  padding: theme.spacing(3),
  paddingBottom: theme.spacing(16),
  minHeight: "100vh",
  marginTop: 64,
  marginBottom: 64,
  [theme.breakpoints.down("md")]: {
    marginBottom: 120,
  },
}));

const RootContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  overflow: "hidden",
  position: "relative",
});

const PlayerWrapper = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(0),
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 2,
  [theme.breakpoints.down("md")]: {
    bottom: 56,
  },
}));

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = () => {
    console.log("Opening menu");
    setIsSideMenuOpen(true);
  };

  const handleMenuClose = () => {
    console.log("Closing menu");
    setIsSideMenuOpen(false);
  };

  return (
    <RootContainer>
      <Header onMenuOpen={handleMenuOpen} />
      <SideMenu
        open={isSideMenuOpen}
        onClose={handleMenuClose}
        variant={isMobile ? "temporary" : "persistent"}
      />
      <MainContent
        sx={{
          marginLeft: !isMobile && isSideMenuOpen ? "240px" : 0,
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </MainContent>
      <PlayerWrapper>
        <VideoPlayerContainer />
      </PlayerWrapper>
      {isMobile && <MobileNavigation />}
    </RootContainer>
  );
};
