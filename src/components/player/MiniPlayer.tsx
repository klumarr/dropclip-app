import { Box, IconButton, Typography, styled, useTheme } from "@mui/material";
import { PlayArrow, Pause, Close, SkipNext } from "@mui/icons-material";
import { useRef } from "react";

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
  bottom: 0,
  left: 0,
  right: 0,
  height: 64,
  backgroundColor: theme.palette.background.paper,
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  zIndex: theme.zIndex.appBar + 1,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  [theme.breakpoints.down("md")]: {
    bottom: 56, // Height of mobile navigation
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
      onExpand();
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only expand if clicking the container itself, not buttons
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(".click-through")
    ) {
      onExpand();
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
