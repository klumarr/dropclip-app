import { Box, IconButton, Typography, styled, useTheme } from "@mui/material";
import { PlayArrow, Pause, Close, SkipNext } from "@mui/icons-material";
import { useRef, useState } from "react";

interface MiniPlayerProps {
  open: boolean;
  onClose: () => void;
  currentVideo: {
    isPlaying: boolean;
    title: string;
    creator: string;
    thumbnailUrl: string;
    currentTime: number;
    duration: number;
    progress: number;
  };
  onPlayPause: () => void;
  onExpand: () => void;
}

const PlayerContainer = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  left: theme.spacing(1.5),
  right: theme.spacing(1.5),
  height: 64,
  backgroundColor: "rgba(24, 24, 24, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  zIndex: theme.zIndex.appBar + 1,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  transform: "translate3d(0, 0, 0)",
  willChange: "transform, height, bottom, left, right, border-radius",
  "&.expanding": {
    bottom: 0,
    left: 0,
    right: 0,
    height: "100vh",
    borderRadius: 0,
    backgroundColor: "rgba(0, 0, 0, 0.98)",
  },
  [theme.breakpoints.down("md")]: {
    bottom: theme.spacing(9), // Height of mobile navigation + spacing
    "&.expanding": {
      bottom: 56, // Height of mobile navigation
    },
  },
}));

const VideoThumbnail = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "& video": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  ".expanding &": {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
}));

export const MiniPlayer = ({
  open,
  onClose,
  currentVideo,
  onPlayPause,
  onExpand,
}: MiniPlayerProps) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;

    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;

    // If swiping up and the distance is significant
    if (diff > 50) {
      touchStartY.current = null;
      handleExpand();
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleExpand = () => {
    setIsExpanding(true);
    // Add a small delay to allow the animation to complete
    setTimeout(() => {
      setIsExpanding(false);
      onExpand();
    }, 300);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only expand if clicking the container itself, not buttons
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(".click-through")
    ) {
      handleExpand();
    }
  };

  if (!open) return null;

  return (
    <PlayerContainer
      ref={containerRef}
      onClick={handleContainerClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={isExpanding ? "expanding" : ""}
    >
      <VideoThumbnail className="click-through">
        <video src={currentVideo.thumbnailUrl} />
      </VideoThumbnail>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          ml: 2,
          opacity: isExpanding ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <Typography variant="subtitle1" noWrap className="click-through">
          {currentVideo.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          className="click-through"
        >
          {currentVideo.creator}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          opacity: isExpanding ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <IconButton onClick={onPlayPause} size="small">
          {currentVideo.isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={() => {}} size="small">
          <SkipNext />
        </IconButton>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>
    </PlayerContainer>
  );
};
