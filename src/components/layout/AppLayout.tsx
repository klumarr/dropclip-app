import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Header } from "./Header";
import MobileNavigation from "./MobileNavigation";
import { styled } from "@mui/material/styles";
import { VideoPlayerContainer } from "../player/VideoPlayerContainer";

const RootContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  overflow: "hidden",
  position: "relative",
});

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = () => {
    console.log("Opening menu");
  };

  return (
    <RootContainer>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Header onMenuOpen={handleMenuOpen} />
        <MainContent component="main">{children}</MainContent>
        {isMobile && <MobileNavigation />}
      </Box>
      <PlayerWrapper>
        <VideoPlayerContainer />
      </PlayerWrapper>
    </RootContainer>
  );
};
