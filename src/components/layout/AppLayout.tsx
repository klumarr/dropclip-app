import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { MobileNavigation } from "./MobileNavigation";
import { MiniPlayer } from "../player/MiniPlayer";
import { styled } from "@mui/material/styles";
import { useState } from "react";

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
}));

const RootContainer = styled(Box)({
  display: "flex",
  height: "100vh",
  overflow: "hidden",
});

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const [currentVideo, setCurrentVideo] = useState({
    isPlaying: false,
    title: "Sample Video",
    creator: "Sample Creator",
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    currentTime: 0,
    duration: 180,
  });

  return (
    <RootContainer>
      <Header onMenuOpen={() => setIsSideMenuOpen(true)} />
      <SideMenu
        open={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
      <MainContent>{children}</MainContent>
      <MiniPlayer
        onExpand={() => setIsVideoPlayerOpen(true)}
        isPlaying={currentVideo.isPlaying}
        title={currentVideo.title}
        creator={currentVideo.creator}
        thumbnailUrl={currentVideo.thumbnailUrl}
        currentTime={currentVideo.currentTime}
        duration={currentVideo.duration}
        onPlayPause={() =>
          setCurrentVideo((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
        }
      />
      <MobileNavigation />
    </RootContainer>
  );
};
